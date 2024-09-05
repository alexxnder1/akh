import { CommandInteraction, EmbedBuilder } from "discord.js";

import { Database } from "../../database/manager";
import { UserDb } from "../../database/tabels/users";
import { Command } from "../../database/tabels/commands";
import { CommandManager } from "../main";

CommandManager.instance.Register(new Command('rank', 'shows your rank', async(interaction: CommandInteraction) => {
     const embed = new EmbedBuilder()    
        .setColor(0x5b0085)
        .setTitle('Rank #' + (await Database.instance.GetRank(interaction.guild.id, interaction.user.id)))
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`Looks nice! 💥 \n${interaction.user}, you are scoring a good rank.`)
        interaction.reply({embeds: [embed]});
}, []));

//264e5f4bc281a46a3
//GET https://www.googleapis.com/customsearch/v1?key=INSERT_YOUR_API_KEY&cx=017576662512468239146:omuauf_lfve&q=lectures
