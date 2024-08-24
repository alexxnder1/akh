import { GuildManager } from "./main";
import { client } from "../../main";
import {  EmbedBuilder, GuildMember } from "discord.js";
import { DOOR_LEAVE } from "../../utils/emojis";
import { Database } from "../database/manager";
import { DELETE_ACCOUNT_AFTER_LEFT_MS } from "../database/tabels/users";

client.on('guildMemberRemove', async(member: GuildMember) => {
    Leave(member);
});

async function Leave(member: GuildMember)
// const 
{
    console.log(`${member.user.username} has left the server.`);

    const embed = new EmbedBuilder()
        .setTitle(`${DOOR_LEAVE} Bye, bye, ${member.user.username}!`)
        .setColor(0xff0000)
        .setDescription(`Joined on ${member.joinedAt.getDay()}/${member.joinedAt.getMonth()}/${member.joinedAt.getFullYear()}.`)
        .setThumbnail(`${member.user.displayAvatarURL()}`)
        .setTimestamp()
    ;
    
    (await GuildManager.instance.GetChannel(GuildManager.instance.guilds.find(g => g.guildId === member.guild.id).memberLeaveChannel)).send({embeds: [embed]});
    
    const user = await Database.instance.GetUser(member.user.id);
    user.deleteTimestamp = (Date.now() + DELETE_ACCOUNT_AFTER_LEFT_MS).toString();
    await Database.instance.UpdateUser(user);
}
