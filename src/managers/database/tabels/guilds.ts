import { RowDataPacket } from "mysql2";
import db from "../connection";
import { Database } from "../manager";
import { client } from "../../../main";
import { Guild, TextChannel } from "discord.js";
import { GuildManager } from "../../events/main";

export class Channel {
    public name: string; 
    public id: string;
    constructor(name: string, id: string) {
        this.name= name;
        this.id = id;
    }
}

export class GuildDb {
    public guildId: string;
    public image: string;
    public name:string;
    public ownerId: string;
    public joinDate: string;
    public bannerURL: string | null;
    public textChannels: Array<Channel> = [];
    public memberJoinChannel: string;
    public memberLeaveChannel: string;

    constructor(guildId: string, image: string, name: string, ownerId:string) {
        this.guildId = guildId;
        this.image = image;
        this.ownerId = ownerId;

        var date = new Date();
        this.joinDate = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} at ${date.getHours() < 10 ? '0'+date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()}`;

        this.name = name;
    }
    
    public async GetMembers() {
        return ((await client.guilds.cache.get(this.guildId).members.fetch()).filter((g => !g.user.bot)));
    }
    public async GetBots() {
        return ((await client.guilds.cache.get(this.guildId).members.fetch()).filter((g => g.user.bot)));
    }
}
