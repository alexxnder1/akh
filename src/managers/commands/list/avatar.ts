import { CommandInteraction, EmbedBuilder, User } from "discord.js";
import { client } from "../../../main";
import { CommandManager } from "../main";
import { Argument, ArgumentType, Command } from "../../database/tabels/commands";

CommandManager.instance.Register(new Command('avatar', 'Show avatar for users', async(interaction: CommandInteraction) => {
    var user: User;
    if(interaction.options.data.length === 0)
        user = interaction.user;

    else user = interaction.options.data.at(0).user;

    const embed = new EmbedBuilder()
        .setTitle(`${user.displayName}'s avatar`)
        .setDescription(user.id === interaction.user.id || user.id === client.user.id ? 'What a nice avatar!': '')
        .setImage(user.displayAvatarURL())
        .setTimestamp()
        // .setFooter({ text: `Requested by ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL({size: 2048}) })
    await interaction.reply({embeds: [embed]});

}, [new Argument(ArgumentType.MENTIONABLE, 'user', 'the user you want to view avatar')]))