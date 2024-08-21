import { CommandInteraction, EmbedBuilder, User } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager } from "../main";
import { client } from "../../../main";

CommandManager.instance.Register(new Command('avatar', 'Show avatar for users', async(interaction: CommandInteraction) => {
    var user: User;
    if(interaction.options.data.length === 0)
        user = interaction.user;

    else user = interaction.options.data.at(0).user;

    const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s avatar`)
        .setDescription(user.id === interaction.user.id || user.id === client.user.id ? 'What a nice avatar!': '')
        .setImage(user.displayAvatarURL())
        .setTimestamp()
        // .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({size: 2048}) })
    await interaction.reply({embeds: [embed]});

}, [new Argument(ArgumentType.MENTIONABLE, 'user', 'the user you want to view avatar')]))