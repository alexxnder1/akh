import { CommandInteraction, Embed, EmbedBuilder } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager } from "../main";
import { Database } from "../../database/manager";
import { GetPercent } from "../../../utils/math";

CommandManager.instance.Register(new Command('help', 'See all commands', async(interaction: CommandInteraction) => {   
    var string: string = '';
    
    CommandManager.instance.commands.forEach((cmd, index) => {
        // embed.addFields( { name: `/${cmd.name}`, value: cmd.description })
        var argumentsString:string = '';
        cmd.options.forEach(argument => {
            argumentsString += `<${argument.name}> `;
        })
        string += `**/${cmd.name}** ${argumentsString} - ${cmd.description}\n`;
    });

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('All commands')
        .setDescription(string)
        .setTimestamp()

    await interaction.reply({embeds: [embed]});
}, []));