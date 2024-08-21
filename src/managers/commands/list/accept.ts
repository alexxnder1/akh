import { CommandInteraction } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager } from "../main";
import { OnCoinflipAccept } from "./coinflip";
import { ChallengeManager } from "../../challenges/main";
import { AcceptTTT } from "./tic-tac-toe";

CommandManager.instance.Register(new Command('accept', 'Accept various challenges', async(interaction: CommandInteraction) => {
    var type = interaction.options.data.at(0);
    var money = interaction.options.data.at(1);

    // if(challenges.find(c => c.guildId === interaction.guild.id && parseInt(c.target.id) === parseInt(interaction.user.id)) === undefined)
    // {
    //     await interaction.reply({content: "That user didn't send any challenge to you.", ephemeral:true});
    //     return;
    // }
    
    if(type.value === 'coinflip')   
        OnCoinflipAccept(interaction, ChallengeManager.instance.challenges.find(c=> c.target.id === interaction.user.id));

    else if(type.value === 'tictactoe')   
        AcceptTTT(interaction);

}, [new Argument(ArgumentType.STRING, 'type', 'coinflip/etc', true), new Argument(ArgumentType.USER, 'user', 'user you want to accept from', true)]));