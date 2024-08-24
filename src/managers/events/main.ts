import { Channel, GuildDb } from '../database/tabels/guilds';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database/connection';
import { Database } from '../database/manager';
import { Events, Guild, GuildMember, GuildMemberEditOptions, TextChannel } from 'discord.js';
import { client } from '../../main';

export class GuildManager {
    public guilds: Array<GuildDb> = [];
    static #instance: GuildManager = null;
    private constructor() {}
    public static get instance(): GuildManager {
        if(!GuildManager.#instance)
            GuildManager.#instance = new GuildManager();

        return GuildManager.#instance;
    }

    public async GetChannel(id: string): Promise<TextChannel | null> {
        
        const channel = await client.channels.fetch(id);
        if(channel?.isTextBased())
            return channel as TextChannel;

        return null;
    }

    public async GetMember(id: string, guild_id: string): Promise<GuildMember | null> {
        const guild = await client.guilds.fetch(guild_id);

        const member = await guild.members.fetch(id);
        if(!member)
            console.log('[GetMember] Couldnt get member id ' + id);
        return member;
    }

    public RemoveGuild(guild: GuildDb) {
        this.guilds.splice(this.guilds.indexOf(guild), 1);
    }

    public async AddGuild(guild: Guild, newGuild: Guild=null):Promise<void> {
        return new Promise<void>(async(resolve, reject) => {
            var guildResult: GuildDb;
            if(newGuild !== null) 
            {
                guildResult = GuildManager.instance.guilds.find(g => g.guildId===newGuild.id);               
                guildResult.image = newGuild.iconURL();
                guildResult.ownerId = newGuild.ownerId;
                guildResult.name = newGuild.name;
                console.log(`[Update Guild] Guild ${newGuild.name} updated.`);
            }

            else guildResult = new GuildDb(guild.id, guild.iconURL(), guild.name, guild.ownerId);
            
            const channels = await guild.channels.fetch();
            channels.forEach((channel) => {
                guildResult.textChannels.push(new Channel(channel.name, channel.id));
            });
            
            GuildManager.instance.guilds.push(guildResult);

            const exists: boolean = await new Promise<boolean>((resolve, reject) => {
                db.query('select * from guilds where guildId=?', [guild.id], (err, res) => {
                    if(err)
                    {
                        console.error(err);
                        reject(err);
                        return;
                    }
        
                    if(res[0] as ResultSetHeader)
                        resolve(true);
                    
                    resolve(false);
                })
            }) 

            if(exists)
            {
                db.query('update guilds set ? where guildId=?', [{image: guildResult.image, ownerId: guildResult.ownerId, name: guildResult.name, textChannels: JSON.stringify(guildResult.textChannels)},  guildResult.guildId], (err, res) =>{
                    if(err)
                    {
                        console.error(err);
                        return;
                    }
                })
                resolve();
            }
            else {
                db.query('insert into guilds (ownerId, guildId, image, name, textChannels, joinDate) values (?, ?, ?, ?, ?)', [guildResult.ownerId,guildResult.guildId, guildResult.image,  guildResult.name,  JSON.stringify(guildResult.textChannels), guildResult.joinDate], (err, res) =>{
                    if(err)
                    {
                        console.error(err);
                        return;
                    }
                })  
                resolve();
            } 
        });
    }
}

client.on('ready', async() => {
    client.guilds.cache.forEach(async (guild) => {
        GuildManager.instance.AddGuild(guild);
        // guilds.forEach(async(guild )=> {
        //     console.log(guild);
        // })
    });
    // for(const guild of guilds.values())

    // guilds.forEach(async(guild) => {
    // });

    // db.query('select * from guilds', [], (err, res) => {
    //     if(err)
    //         console.error(err);

    //     (res as Array<GuildDb>).forEach(async(g) => {
    //         const guild = await client.guilds.fetch(g.guildId);
    //         await GuildManager.instance.AddGuild(guild);
    //     });
       
    // })
    console.log(GuildManager.instance.guilds);
});

import './bye';
import './hello';
import './checkDeletion'; 
import './member-edit';
import './guildUpdate';