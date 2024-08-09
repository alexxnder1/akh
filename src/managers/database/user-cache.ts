import { GuildMember } from "discord.js";
import { client } from "../../main";
import db from "./connection";
import { InsertUserIfNotExists } from "./userAutoRegistration";

export class UserDb {
    public coins: number;
    public totalCoinflips: number;
    public coinflipWins: number;
    public coinflipLoss: number;
    public discordId: number;    
}

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

    public SetUpdateCachedValuesInterval() {
        this.intervals.forEach(int => clearInterval(int));
        this.intervals = [];
            
        var count: number = 0;
        client.guilds.fetch().then(guilds => {
            guilds.forEach(guild => {
   
                var int: NodeJS.Timeout = setInterval(() => {
                    this.cache.users.forEach((user, id) => {
                        db.query(`update users set ? where ?`, [user, {discordId: user.discordId, guildId: guild.id}], (err, res)=>{
                            if(err) throw err;
                            console.log(`[Cache] Updated ${res['affectedRows']} values for ${user.discordId} (${guild.name}).`);
                        }) ;
                    });
                }, (count+1)*parseInt(process.env.UPDATE_CACHE_TO_DB)*1000);
    
                this.intervals.push(int);
                count++;
            })
        });
    }

    public RemoveCache(discord_id: number) {
        var user = this.cache.users.findIndex(d => d.discordId === discord_id);
        if(user != -1) {
            this.cache.users.splice(user, 1);
            console.log('Removed cache for user ' + discord_id);
        }
        else console.log(`Cannot remove cache for ${discord_id}.`);

    }

    public async GetUser(discord_id: string, guild_id: number=parseInt(process.env.DEBUG_GUILD_ID)): Promise<UserDb> {
        await InsertUserIfNotExists(discord_id);

        try {
            var user = this.cache.users.find(d => parseInt(discord_id) === d.discordId);
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
    Database.instance.RemoveCache(parseInt(member.id));
});

Database.instance.SetUpdateCachedValuesInterval();