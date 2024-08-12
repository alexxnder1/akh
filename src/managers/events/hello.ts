import { GuildManager } from "./main";
import { client } from "../../main";
import {  EmbedBuilder, GuildMember } from "discord.js";
import { WAVING_HAND } from "../../utils/emojis";

client.on('guildMemberAdd', async(member: GuildMember) => {
    Wave(member);
});

async function Wave(member: GuildMember)
{
    console.log(`${member.user.username} has joined the server.`);

    const embed = new EmbedBuilder()
        .setTitle(`${WAVING_HAND} Welcome, ${member.user.username}!`)
        .setColor(member.user.hexAccentColor || '#00FF00')
        .setDescription(`Account created on ${member.user.createdAt.getDay()}/${member.user.createdAt.getMonth()}/${member.user.createdAt.getFullYear()}.`)
        .setThumbnail(`${member.user.displayAvatarURL()}`)
        .setTimestamp()
    ;
    (await GuildManager.instance.GetChannel(GuildManager.instance.data.memberJoinChannel)).send({embeds: [embed]})
}
