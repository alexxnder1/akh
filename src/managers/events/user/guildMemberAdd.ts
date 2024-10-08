import {  CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Database } from "../../database/manager";
import { WAVING_HAND } from "../../../utils/emojis";
import { client } from "../../../main";
import { GuildManager } from "../main";
import { UserDb } from "../../database/tabels/users";

client.on('guildMemberAdd', async(member: GuildMember) => {
    Wave(member);
});

async function Wave(member: GuildMember)
{
    console.log(`${member.user.displayName} has joined the server.`);
    await Database.instance.SetupUser(member.user.id);

    const embed = new EmbedBuilder()
        .setTitle(`${WAVING_HAND} Welcome, ${member.user.displayName}!`)
        .setColor(member.user.hexAccentColor || '#00FF00')
        .setDescription(`Account created on ${member.user.createdAt.getDay()}/${member.user.createdAt.getMonth()}/${member.user.createdAt.getFullYear()}.`)
        .setThumbnail(`${member.user.displayAvatarURL()}`)
        .setTimestamp()
    ;
    (await GuildManager.instance.GetChannel(GuildManager.instance.guilds.find(g => g.guildId === member.guild.id).memberJoinChannel)).send({embeds: [embed]})
    
    const data = await Database.instance.GetUserData(member.user.id, member.guild.id) as UserDb;
    data.deleteTimestamp = 'null';
    await Database.instance.UpdateUser(data);
}
