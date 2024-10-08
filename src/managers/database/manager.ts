import { DefaultWebSocketManagerOptions, Guild,  GuildInviteManager,  GuildMember, User, UserBannerFormat } from "discord.js";
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

    private constructor() {

    }

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
            delete user['id'];
            db.query(`update users set ? where discordId=?`, [user, user.discordId], (err, res)=>{
                if(err) throw err;
                console.log((res as ResultSetHeader));
                if((res as ResultSetHeader).affectedRows !== 0)
                    console.log(`[Cache] Updated ${res['affectedRows']} values for ${user.discordId}).`);
            });
        });
    }

    public async UpdateUserDetails(user: User) {
        db.query(`update users set ? where discordId=?`, [{name: user.displayName, avatar: user.displayAvatarURL()}, user.id], (err, ) => {
            if(err)
            {
                console.error(err);
                return;
            }
        })
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

    public async UpdateCacheFromDb(discordId: string, guildId: string) {
        var userData = (await this.GetUserData(discordId, guildId)) as UserDb;
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
        delete user['id'];
        db.query('update users set ? where discordId=? and guildId=?', [user, user.discordId, user.guildId], (err, res) => {
            if(err)
            {
                console.error(err);
                return;
            }

            console.log(`[Query] Updated ${user.discordId}'s properties for guildId ${user.guildId}.`);
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
    public async SetupUser(discord_id: string, guild_id: string=process.env.DEBUG_GUILD_ID!): Promise<void> {
        const results = await new Promise<RowDataPacket[]>((resolve, reject) => {
            db.query('select discordId from users where discordId=? AND guildId=?', [discord_id, guild_id], (err, res) => {
                if (err) return reject(err);
                resolve(res as RowDataPacket[]); // explicitly casting to RowDataPacket[]
            });
        });

        var user = await this.GetGuildMemberById(discord_id);
        if (results.length === 0) {
            await new Promise<ResultSetHeader>(async (resolve, reject) => {
                db.query('insert into users (discordId, guildId, avatar, name) values (?, ?, ?, ?)', [discord_id, guild_id, user.displayAvatarURL(), user.displayName], (err, res) => {
                    if (err) return reject(err);
                    console.log(`[DB] ${discord_id} (guild_id ${guild_id}) added to tabel.`);
                    resolve(res as ResultSetHeader); // explicitly casting to OkPacket
                });
            });
        }
        // else Database.instance.UpdateUserDetails(user);
    }

    public async GetUserData(discord_id: string, guild_id: string=undefined): Promise<Array<UserDb> | UserDb> {
        // await this.SetupUser(discord_id, guild_id);
        console.log(discord_id);
        try {
            var users = this.cache.users.filter(d => (guild_id !== undefined ? d.guildId === guild_id : true) && discord_id === d.discordId);
            if(users.length>0) {      
                return users.length === 1 ? users.at(0) : users;

            } else {
                return new Promise<Array<UserDb> | UserDb>(resolve => {
                    db.query(`select * from users where discordId=? ` + (guild_id !== undefined ? `and guildId=?` : ''), [discord_id, guild_id !== undefined && guild_id], (err, res) => {
                        if(err)
                            throw err;
                        console.log('result: ' + res);
                        if(res !== undefined)
                        {
                            var results = res as Array<UserDb>;
                                                        
                            console.log(`[DB Cache] Cache created for user ${discord_id}.`);
                            this.cache.users.concat(results);
                            resolve(results.length === 1 ? results.at(0) : results);       
                        }
                        else
                        {
                            console.log('[Db Cache] Can not find cache for user ' + discord_id);
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