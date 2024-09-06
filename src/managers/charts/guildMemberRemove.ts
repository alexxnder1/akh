import { Events, GuildMember } from "discord.js";
import { client } from "../../main";
import { ChartManager } from "./manager";
import { GuildManager } from "../events/main";

client.on(Events.GuildMemberRemove, (member: GuildMember) => {
    ChartManager.instance.AddGuildData(GuildManager.instance.guilds.find(g => g.guildId === member.guild.id));
}); 