import { GuildManager } from "../main";
import { client } from "../../../main";
import {  EmbedBuilder, Events, GuildMember } from "discord.js";
import { DOOR_LEAVE } from "../../../utils/emojis";
import { Database } from "../../database/manager";
import { DELETE_ACCOUNT_AFTER_LEFT_MS, UserDb } from "../../database/tabels/users";

client.on('guildMemberRemove', async(member: GuildMember) => {
    Leave(member);
    if(member.user.id === client.user.id)
        Database.instance.DeleteGuildInfo(member.guild.id);
});

async function Leave(member: GuildMember)
{
    if(member.user.id === client.user.id)
        return;
    
    console.log(`${member.user.displayName} has left the server.`);

    const embed = new EmbedBuilder()
        .setTitle(`${DOOR_LEAVE} Bye, bye, ${member.user.displayName}!`)
        .setColor(0xff0000)
        .setDescription(`Joined on ${member.joinedAt.getDay()}/${member.joinedAt.getMonth()}/${member.joinedAt.getFullYear()}.`)
        .setThumbnail(`${member.user.displayAvatarURL()}`)
        .setTimestamp()
    ;
    
    (await GuildManager.instance.GetChannel(GuildManager.instance.guilds.find(g => g.guildId === member.guild.id).memberLeaveChannel)).send({embeds: [embed]});
    
    const user = await Database.instance.GetUserData(member.user.id) as UserDb;
    user.deleteTimestamp = (Date.now() + DELETE_ACCOUNT_AFTER_LEFT_MS).toString();
    await Database.instance.UpdateUser(user);
}