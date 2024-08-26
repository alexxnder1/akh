import { Events, User } from "discord.js";
import { client } from "../../../main";
import { Database } from "../../database/manager";

client.on(Events.GuildDelete, (guild) => {
    Database.instance.DeleteGuildInfo(guild.id);
})