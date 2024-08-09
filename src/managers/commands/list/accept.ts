import { CommandInteraction } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager } from "../main";
import { challenges, OnCoinflipAccept } from "./coinflip";

CommandManager.instance.Register(new Command('accept', 'Accept various challanges', async(interaction: CommandInteraction) => {
    var type = interaction.options.data.at(0);
    var money = interaction.options.data.at(1);

    if(challenges.find(c => c.guildId === parseInt(interaction.guild.id) && parseInt(c.target.id) === parseInt(interaction.user.id)) === undefined)
    {
        await interaction.reply("That user didn't send any challenge to you.");
        return;
    }
    
    if(type.value === 'coinflip')   
        OnCoinflipAccept(interaction, challenges.find(c=> c.target.id === interaction.user.id));

}, [new Argument(ArgumentType.STRING, 'type', 'coinflip/etc', true), new Argument(ArgumentType.USER, 'user', 'user you want to accept from', true)]));