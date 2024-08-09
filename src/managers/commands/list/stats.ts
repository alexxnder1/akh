import { CommandInteraction, Embed, EmbedBuilder } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager } from "../main";
import { Database } from "../../database/user-cache";
import { GetPercent } from "../../../utils/math";

CommandManager.instance.Register(new Command('stats', 'See your statistics', async(interaction: CommandInteraction) => {
    const data = await Database.instance.GetUser(interaction.user.id);

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Your statistics')
        .setDescription('Look! Here are all of your stats.')
        .addFields(
            { name: 'Coinflip', value: ' ' },
            { name: '`Coins`', value: '`' + data.coins + '`', inline: true },
            { name: '`Total Coinflips`', value: '`' + data.totalCoinflips + '`', inline: true },
		    { name: '\u200B', value: '\u200B', inline:true},
            { name: "`Wins " + GetPercent(data.coinflipWins, data.totalCoinflips) +"%`", value: '`' + data.coinflipWins + '`', inline: true },
            { name: "`Loss " + GetPercent(data.coinflipLoss, data.totalCoinflips) +"%`", value: '`' + data.coinflipLoss + '`', inline: true },
            { name: '===========================', value: ' ' },
        )
        .setTimestamp()

    await interaction.reply({embeds: [embed], ephemeral: true});
}, []));