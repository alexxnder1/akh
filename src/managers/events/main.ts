import { GuildDb } from '../database/tabels/guilds';
import { RowDataPacket } from 'mysql2';
import db from '../database/connection';
import { Database } from '../database/manager';
import { Guild, GuildMember, GuildMemberEditOptions, TextChannel } from 'discord.js';
import { client } from '../../main';

export class GuildManager {
    public data: GuildDb = null;
    static #instance: GuildManager = null;
    public reference: Guild = null;
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

    public async GetMember(id: string): Promise<GuildMember | null> {
        const member = await GuildManager.instance.reference.members.fetch(id);
        if(!member)
            console.log('[GetMember] Couldnt get member id ' + id);
        return member;
    }
}

client.on('ready', () => {
    db.query('select * from guilds where guildId=?', [process.env.DEBUG_GUILD_ID!], (err, res) => {
        if(err)
            console.error(err)

        GuildManager.instance.data = res[0] as GuildDb;

        client.guilds.fetch(GuildManager.instance.data.guildId).then((guild: Guild) => {
            GuildManager.instance.reference = guild;

        }).catch(console.error);
    })
});

import './bye';
import './hello';
// import 