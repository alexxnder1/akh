import { GuildManager } from "./main";
import { client } from "../../main";
import {  EmbedBuilder, GuildMember } from "discord.js";
import { DOOR_LEAVE } from "../../utils/emojis";

client.on('guildMemberRemove', async(member: GuildMember) => {
    Leave(member);
});

async function Leave(member: GuildMember)
{
    console.log(`${member.user.username} has left the server.`);

    const embed = new EmbedBuilder()
        .setTitle(`${DOOR_LEAVE} Bye, bye, ${member.user.username}!`)
        .setColor(0xff0000)
        .setDescription(`Joined on ${member.joinedAt.getDay()}/${member.joinedAt.getMonth()}/${member.joinedAt.getFullYear()}.`)
        .setThumbnail(`${member.user.displayAvatarURL()}`)
        .setTimestamp()
    ;
    (await GuildManager.instance.GetChannel(GuildManager.instance.data.memberLeaveChannel)).send({embeds: [embed]});
}
