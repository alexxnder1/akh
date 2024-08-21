import { Guild,  GuildMember } from "discord.js";
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
            db.query(`update users set ? where discordId=? and guildId=?`, [user, user.discordId, GuildManager.instance.data.guildId], (err, res)=>{
                if(err) throw err;
                console.log((res as ResultSetHeader));
                if((res as ResultSetHeader).affectedRows !== 0)
                    console.log(`[Cache] Updated ${res['affectedRows']} values for ${user.discordId} (${GuildManager.instance.reference.name}).`);
            });
        });
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
        else console.log(`Cannot remove cache for ${discord_id}.`);

    }


    public async GetUser(discord_id: string, guild_id: string=process.env.DEBUG_GUILD_ID!): Promise<UserDb> {
        const results = await new Promise<RowDataPacket[]>((resolve, reject) => {
            db.query('select discordId from users where discordId=? AND guildId=?', [discord_id, guild_id], (err, res) => {
                if (err) return reject(err);
                resolve(res as RowDataPacket[]); // Explicitly casting to RowDataPacket[]
            });
        });

        if (results.length === 0) {
            await new Promise<ResultSetHeader>((resolve, reject) => {
                db.query('insert into users (discordId, guildId) values (?, ?)', [discord_id, guild_id], (err, res) => {
                    if (err) return reject(err);
                    console.log(`[DB] ${discord_id} (guild_id ${guild_id}) is not registered in database, I'm adding it.`);
                    resolve(res as ResultSetHeader); // Explicitly casting to OkPacket
                });
            });
        }
        
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