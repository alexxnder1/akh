import { CommandInteraction, EmbedBuilder } from "discord.js";
import {  Argument, ArgumentType, Command } from "../../database/tabels/commands";
import { CommandManager } from "../main";
import { Database } from "../../database/manager";
import { UserDb } from "../../database/tabels/users";

CommandManager.instance.Register(new Command('top', 'shows the server rank', async(interaction: CommandInteraction) => {
    
    var string: string = '';
    
    var users: Array<UserDb> = await Database.instance.GetTopRank(interaction.guild.id);
    console.log(users);
    users.forEach((user, index) => {
        string += `${index}. <@${user.discordId}> - ${user.coins} coins\n`;
    });

    const embed = new EmbedBuilder()    
        .setColor(0x5b0085)
        .setTitle('Rank')
        .setDescription(string)

    interaction.reply({embeds: [embed]});
}, []));