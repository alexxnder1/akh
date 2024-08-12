import { RowDataPacket } from "mysql2";
import db from "../connection";
import { Database } from "../manager";
import { client } from "../../../main";
import { Guild, TextChannel } from "discord.js";

export class GuildDb {
    public guildId: string;
    public memberJoinChannel: string;
    public memberLeaveChannel: string;
}
