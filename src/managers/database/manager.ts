import { DefaultWebSocketManagerOptions, Guild,  GuildMember, User, UserBannerFormat } from "discord.js";
import { client } from "../../main";
import db from "./connection";
import { UserDb } from "./tabels/users";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { GuildDb } from "./tabels/guilds";
import './tabels/guilds';
import { GuildManager } from "../events/main";

export class DatabaseCache {
    public users: Array<UserDb> = [];
   
}

export class Database {
    static #instance: Database = null;

    public cache: DatabaseCache = null;

    private constructor() {}

    public static get instance(): Database {
        if(!Database.#instance)
        {
            Database.#instance = new Database();
            Database.#instance.cache = new DatabaseCache();
            
        }

        return Database.#instance;
    }

    private intervals: Array<NodeJS.Timeout> = [];

    public SetUpdateCachedValuesInterval(force:boolean = false) {
        // might be a problem. to be checked (M-L)
        this.intervals.forEach(int => clearInterval(int));
        this.intervals = [];

        if(force) {
            this.UpdateCacheForAllUsersToDb();
            console.log('forced');
        }
        else {
            var int: NodeJS.Timeout = setInterval(() => {
                this.UpdateCacheForAllUsersToDb();
            }, parseInt(process.env.UPDATE_CACHE_TO_DB!));
            this.intervals.push(int);
        }        
    }

    public UpdateCacheForAllUsersToDb() {
        this.cache.users.forEach((user, id) => {
            db.query(`update users set ? where discordId=?`, [user, user.discordId], (err, res)=>{
                if(err) throw err;
                // console.log((res as ResultSetHeader));
                // if((res as ResultSetHeader).affectedRows !== 0)
                    // console.log(`[Cache] Updated ${res['affectedRows']} values for ${user.discordId} (${GuildManager.instance.reference.name}).`);
            });
        });
    }

    public async GetTopRank(guildId: string): Promise<Array<UserDb>> {
         return await new Promise<Array<UserDb>>((resolve, reject) => {
            db.query('select * from users where guildId=? ORDER BY coins DESC', [guildId], (err, res) => {
                if (err) reject(err);
                if (res[0] as ResultSetHeader)
                    resolve(res as RowDataPacket as Array<UserDb>);
            })
         }) 
    }
    public async GetRank(guildId: string, id: string): Promise<number> {
        return await new Promise<number>((resolve, reject) => {
            db.query('select * from users where guildId=? ORDER BY coins DESC', [guildId], (err, res) => {
                if (err) reject(err);
               if (res[0] as ResultSetHeader)
                {
                    (res as RowDataPacket[] as Array<UserDb>).forEach((user: UserDb, index: number) => {
                        if(user.discordId === id)
                            resolve(index+1);
                    }); 
                }   
           })
        }) 
   }

    public async UpdateCacheFromDb(discordId: string) {
        var userData: UserDb = await this.GetUser(discordId);
        if(userData)
        {
            db.query('select * from users where discordId=?', [discordId], async(err, res) => {
                if(err)
                    throw err;
                
                let result : ResultSetHeader = res[0] as ResultSetHeader;
                if(!result)
                {
                    console.error('Cannot get user from db.');
                    return;
                }

                else {
                    userData = (res[0] as ResultSetHeader) as unknown as UserDb;
                    console.log(`Cache updated from db for ${discordId}`);
                }
            })
        }
        else throw new Error(`An error occurred creating cache for user ${discordId}.`);
    }

    public RemoveCache(discord_id: string) {
        var user = this.cache.users.findIndex(d => d.discordId === discord_id);
        if(user != -1) {
            this.cache.users.splice(user, 1);
            console.log('Removed cache for user ' + discord_id);
        }
    }
    
    public async DeleteUser(discord_id: string) {
        db.query('delete from users where discordId=?', [discord_id] ,(err, res) => {
            if(err)
            {
                console.error(err);
                return;
            }
            
            this.RemoveCache(discord_id);
            console.log('Deleted user ' + discord_id);
        })
    }

    public async UpdateUser(user: UserDb) {
        db.query('update users set ? where discordId=?', [user, user.discordId], (err, res) => {
            if(err)
            {
                console.error(err);
                return;
            }

            console.log(`[Query] Updated ${user.discordId}'s properties.`);
        })
    }

    public async DeleteGuildInfo(guild_id: string) {
        console.log('delete guild info ' + guild_id);
        this.cache.users.forEach(u => {
            if(u.discordId === guild_id)
                this.RemoveCache(u.discordId);
            
        })
        db.query('delete from users where guildId=?', [guild_id], (err, res) => {
            if(err)
            {
                console.log(err);
                return;
            }

            // console.log(res);
            // this.RemoveCache(res)
        })
        db.query('delete from guilds where guildId=?', [guild_id], (err, res) => {
            if(err)
            {
                console.log(err);
                return;
            }
        })

    }

    public async GetGuildMemberById(discord_id: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            client.users.fetch(discord_id).then((user) => {
                resolve(user);
            });
        }); 
    }
    public async CreateUser(discord_id: string, guild_id: string=process.env.DEBUG_GUILD_ID!): Promise<void> {
        const results = await new Promise<RowDataPacket[]>((resolve, reject) => {
            db.query('select discordId from users where discordId=? AND guildId=?', [discord_id, guild_id], (err, res) => {
                if (err) return reject(err);
                resolve(res as RowDataPacket[]); // Explicitly casting to RowDataPacket[]
            });
        });

        if (results.length === 0) {
            await new Promise<ResultSetHeader>(async (resolve, reject) => {
                var user = await this.GetGuildMemberById(discord_id);
                console.log(user);
                db.query('insert into users (discordId, guildId, avatar, name) values (?, ?, ?, ?)', [discord_id, guild_id, user.displayAvatarURL(), user.username], (err, res) => {
                    if (err) return reject(err);
                    console.log(`[DB] ${discord_id} (guild_id ${guild_id}) is not registered in database, I'm adding it.`);
                    resolve(res as ResultSetHeader); // Explicitly casting to OkPacket
                });
            });
        }
    }
    public async GetUser(discord_id: string, guild_id: string=process.env.DEBUG_GUILD_ID!): Promise<UserDb> {
        await this.CreateUser(discord_id, guild_id);
        
        try {
            var user = this.cache.users.find(d => discord_id === d.discordId);
            if(user) {      
                return user;
            } else {
                
                return new Promise<UserDb>(resolve => {
                    db.query('select * from users where discordId=? and guildId=?', [discord_id, guild_id], (err, res) => {
                        if(err)
                            throw err;
                        
                        if(res[0] !== undefined)
                        {
                            var userDb = new UserDb();
                            // userDb.discordId = parseInt(discord_id);
                            // userDb.coinflipLoss = res[0].coinflipLoss;
                            // userDb.coinflipWins = res[0].coinflipWins;
                            // userDb.coins = res[0].coins;
                            // userDb.lossRate = res[0].lossRate;
                            // userDb.totalCoinflips = res[0].totalCoinflips;
                            // userDb.winRate = res[0].winRate;
                            userDb = res[0] as UserDb;
                                                        
                            console.log(`[DB Cache] Cache created for user ${discord_id}.`);
                            this.cache.users.push(userDb);
                            resolve(userDb);       
        
                        }
                        else
                        {
                            console.log('it s not created');
                            resolve(null);
                            return null;
                        }
    
                    })
                });
            }
        } catch(err) {
            console.error(err);
        }
    }
}

client.on('guildMemberRemove', (member: GuildMember) => {
    Database.instance.RemoveCache(member.id);
});

// Gestionarea semnalelor de oprire
const handleExit = async (signal: string) => {
    // tbc
    Database.instance.SetUpdateCachedValuesInterval(true);
    console.log(`Received ${signal}. Shutting down...`);

    await client.destroy();

    // console.log('\nBot has been shut down gracefully.');
    process.exit(0); 
};

process.on('SIGINT', () => handleExit('SIGINT'));
process.on('SIGTERM', () => handleExit('SIGTERM'));

Database.instance.SetUpdateCachedValuesInterval();