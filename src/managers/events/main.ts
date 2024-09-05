import { Channel, GuildDb } from '../database/tabels/guilds';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../database/connection';
import { Database } from '../database/manager';
import { Events, Guild, GuildMember, GuildMemberEditOptions, TextChannel } from 'discord.js';
import { client } from '../../main';

export const DEFAULT_ICON_FOR_SERVER = 'https://icons.veryicon.com/png/o/miscellaneous/open-ncloud/the-server-4.png';
export const DEFAULT_BANNER_FOR_NULL = 'https://cdn.prod.website-files.com/5f9072399b2640f14d6a2bf4/6348685d7c7b4e693020de8c_macro%20hero-blog%20header%402x-p-1600.png';

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
            
            guildResult.bannerURL = guild.bannerURL() !== null ? guild.bannerURL() : DEFAULT_BANNER_FOR_NULL;
            const channels = await guild.channels.fetch();
            channels.forEach((channel) => {
                guildResult.textChannels.push(new Channel(channel.name, channel.id));
            });
            
            // resolve();
            guild.members.cache.forEach((member) => {
                // if not exists
                if(!member.user.bot)
                    Database.instance.CreateUser(member.user.id, guild.id);
            });
            db.query('update guilds set ? where guildId=?', [{image: guildResult.image ? guildResult.image : DEFAULT_ICON_FOR_SERVER, ownerId: guildResult.ownerId, bannerURL: guildResult.bannerURL, name: guildResult.name, textChannels: JSON.stringify(guildResult.textChannels)},  guildResult.guildId], (err, res) =>{
                if(err)
                {
                    console.error(err);
                    return;
                }
            })
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

            if(!exists) {
                db.query('insert into guilds (ownerId, guildId, image, name, textChannels, joinDate, bannerURL) values (?, ?, ?, ?, ?, ?, ?)', [guildResult.ownerId,guildResult.guildId, guildResult.image ? guildResult.image : 'https://icons.veryicon.com/png/o/miscellaneous/open-ncloud/the-server-4.png',  guildResult.name,  JSON.stringify(guildResult.textChannels), guildResult.joinDate, guildResult.bannerURL], (err, res) =>{
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
        
        const members = await guild.members.fetch();
        members.forEach((member) => {
            // if not exists
            if(!member.user.bot)
                Database.instance.CreateUser(member.user.id, guild.id);
        });

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

import './user/guildMemberLeave';

import './guild/checkDeletion'; 
import'./guild/guildDelete';
import './guild/guildUpdate';
import './user/guildMemberRemove';
import './user/guildMemberUpdate';
import './guild/guildCreate';