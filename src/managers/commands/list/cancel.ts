import { CommandInteraction, Embed, EmbedBuilder } from "discord.js";
import { Database } from "../../database/manager";
import { GetPercent } from "../../../utils/math";
import { Challenge, ChallengeManager, DeleteChallenge, DeleteReason, GetUserInChallenge, IsUserInChallenge } from "../../challenges/main";
import { CommandManager } from "../main";
import { Argument, ArgumentType, Command } from "../../database/tabels/commands";

CommandManager.instance.Register(new Command('cancel', 'cancel a challenge', async(interaction: CommandInteraction) => {
    var challenge = GetUserInChallenge(interaction.user.id, interaction.guild.id, Challenge);
    if(interaction.options.data.length === 0)
        return interaction.reply({content: 'You must specify an user.', ephemeral: true});
    
    var user = interaction.options.data.at(0);    
    if(!challenge)
        return interaction.reply({content: `You are provoked/active in a challenge with ${user.name}.`, ephemeral: true})

    // ChallengeManager.instance.removeChallenge(challenge, );  
    DeleteChallenge(challenge, DeleteReason.EXPIRED);    
}, [new Argument(ArgumentType.MENTIONABLE, 'user', 'user you want to cancel challenge')]));