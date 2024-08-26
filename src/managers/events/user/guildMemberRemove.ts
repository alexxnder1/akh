import { Events, User } from "discord.js";
import { client } from "../../../main";
import { Database } from "../../database/manager";

client.on(Events.GuildBanRemove, (member) => {
    if(member.user.id === client.user.id)
        Database.instance.DeleteGuildInfo(member.guild.id);
})