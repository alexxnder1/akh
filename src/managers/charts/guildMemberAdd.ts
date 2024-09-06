import { Events, Guild,  GuildMember } from "discord.js";
import { client } from "../../main";
import { ChartManager, UserChart } from "./manager";
import { GuildManager } from "../events/main";

client.on(Events.GuildMemberAdd, (member: GuildMember) => {
    ChartManager.instance.AddGuildData(GuildManager.instance.guilds.find(g => g.guildId === member.guild.id));
}); 