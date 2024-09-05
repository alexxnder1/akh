import {  Argument, ArgumentType, Command } from "../../database/tabels/commands";
import { CommandManager } from "../main";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, Embed, EmbedBuilder, escapeHeading, Events, Interaction, User } from "discord.js";
import { ChallengeManager, CountChallangesOfType as CountChallengesOfType, DeleteChallenge, DeleteReason, EXPIRE_TIME, GetUserInChallenge, IsUserInChallenge, IsUserProvokedBy } from "../../challenges/main";
import { Database } from "../../database/manager";
import { client } from "../../../main";
import { GetWinPattern, CheckDraw,TicTacToe } from "../../challenges/tic-tac-toe";

CommandManager.instance.Register(new Command('tictactoe', 'Play tic-tac-toe with your friens/bot', async (interaction: CommandInteraction) => {
  
    if(interaction.options.data.length === 0)
        return interaction.reply({content: 'Please provide an user.', ephemeral: true});

    if(interaction.options.data.length === 1)
        return interaction.reply({content: 'Please provide a bet.', ephemeral: true});

    var user = interaction.options.data.at(0).user as User;
    var bet = interaction.options.data.at(1).value as number;
    
    if(user.id === interaction.user.id)
        return interaction.reply({content: 'You cannot provoke yourself.', ephemeral: true});

    if(IsUserInChallenge(user.id, interaction.guild.id, TicTacToe))
        return interaction.reply({content: "We're sorry but that user is in a Tic-Tac-Toe game."});

    if(IsUserProvokedBy(user.id, interaction.user.id, interaction.guild.id, TicTacToe))
        return interaction.reply({content: 'You cannot provoke that user multiple times.', ephemeral: true});

    var userData = await Database.instance.GetUser(interaction.user.id);
    var targetData = await Database.instance.GetUser(user.id);
    
    if(bet < 0 || bet > userData.coins)
        return interaction.reply({content: 'Insufficient funds.', ephemeral: true});

    if(bet < 0 || bet > targetData.coins)
        return interaction.reply({content: `Insufficient funds for ${user}.`, ephemeral: true});
    
    var chal = new TicTacToe(interaction.user, user, bet, interaction.guild.id);
    // ChallengeManager.instance.addChallenge(chal);
    // challenges.push(chal);
    chal.message = await interaction.channel.send({content: `${interaction.user} provoked ${user} in TicTacToe for ${bet}.`});
    // challenges.splice(challenges.indexOf(chal), 1);
 
    // interaction.reply({content: 'test', components: rows})   
}, [new Argument(ArgumentType.MENTIONABLE, 'user', 'user you want to play with'), new Argument(ArgumentType.NUMBER, 'bet', 'bet')]));

export async function AcceptTTT(interaction: CommandInteraction)
{
    if(interaction.options.data.length === 0)
        return interaction.reply({content: 'Provide a user', ephemeral: true });
    
    var target = interaction.options.data.at(1).user as User;
    if(!IsUserProvokedBy(interaction.user.id, target.id, interaction.guild.id, TicTacToe))
        return interaction.reply('You are not in a TTT challenge with that user.');

    if(GetUserInChallenge(target.id, interaction.guild.id, TicTacToe)?.target.id !== interaction.user.id)
        return interaction.reply('That user is already in a TTT challenge.');

    var challenge = GetUserInChallenge(target.id, interaction.guild.id, TicTacToe) as TicTacToe;
    challenge.started = true;

    var rand = Math.random();
    challenge.turnUser = rand <= 0.5 ? target : interaction.user;
    challenge.zeroUser = rand <= 0.5 ? interaction.user : target;
    challenge.xUser = rand <= 0.5 ? target : interaction.user;
    
    var rows: Array<ActionRowBuilder<ButtonBuilder>> =[];
    for(var i = 0; i < 3; i++)
    {
        const row = new ActionRowBuilder<ButtonBuilder>()
        for(var j = 0; j < 3; j++)
        {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ttt_${i}, ${j}`)
                    .setLabel('-')
                    .setStyle(ButtonStyle.Primary)
            )
        }
        rows.push(row)         
    }
    const embed = new EmbedBuilder()
        .setColor(challenge.turnUser === challenge.xUser ? 0xba2711 : 0x4ba100)
        .setTitle(`Tic-Tac-Toe #${CountChallengesOfType(TicTacToe)}`)
        .setDescription(`${challenge.xUser} - ❌\n${challenge.zeroUser} - 🅾\nBet: **${challenge.coins}** coins\n\nTurn: ${challenge.turnUser}`)

    challenge.message = await interaction.channel.send({components: rows, embeds: [embed]});
    interaction.reply({ephemeral:true, content: `You accepted ${target}'s tic-tac-toe challenge for ${challenge.coins}.`});
}

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if(!interaction.isButton())
        return;

    if(!interaction.message)
        return;
    
    if(!interaction.customId.startsWith(`ttt_`))
        return;

    var challenge = ChallengeManager.instance.challenges.find(c => c.message.id === (interaction as any).message.id) as TicTacToe;
    if(GetUserInChallenge(interaction.user.id, interaction.guild.id, TicTacToe) != challenge)
        return interaction.reply({content: 'You are not in that challenge.', ephemeral: true});    
    
    interaction = interaction as ButtonInteraction;
    if(challenge.turnUser !== interaction.user)
        return interaction.deferUpdate();  
    
    let matrixI:number = parseInt(interaction.customId.split(", ")[0]);
    let matrixJ:number = parseInt(interaction.customId.split(", ")[1]);
    if(challenge.tabel[matrixI][matrixJ] !== '-2')
        return interaction.deferUpdate();
    challenge.tabel[matrixI][matrixJ] = challenge.xUser === interaction.user ? 'X' : 'O';

    var rows: Array<ActionRowBuilder<ButtonBuilder>> =[];
    for(var i = 0; i < 3; i++)
    {
        const row = new ActionRowBuilder<ButtonBuilder>()
        for(var j = 0; j < 3; j++)
        {
            var label: string = "";
            var btn: ButtonStyle = ButtonStyle.Primary;
            if(challenge.tabel[i][j] === 'X')
            {
                label = '❌';
                btn = ButtonStyle.Danger;
            }
            else if(challenge.tabel[i][j] === 'O')
            {
                label = '🅾';
                btn = ButtonStyle.Success;
            }

            
            else label = '-';
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ttt_${i}, ${j}`)
                    .setLabel(label)
                    .setStyle(btn)
            )
        }
        rows.push(row)         
    }
    challenge.turnUser = challenge.turnUser === challenge.propose ? challenge.target : challenge.propose;
  
    const embed = new EmbedBuilder()
        .setColor(challenge.turnUser === challenge.xUser ? 0xba2711 : 0x4ba100)
        .setTitle(`Tic-Tac-Toe #${CountChallengesOfType(TicTacToe)}`)
        .setDescription(`${challenge.xUser} - ❌\n${challenge.zeroUser} - 🅾\nBet: **${challenge.coins}** coins\n\nTurn: ${challenge.turnUser}`)
    challenge.message.edit({components: rows, embeds: [embed]})

    if(CheckDraw(challenge.tabel))
        DeleteChallenge(challenge, DeleteReason.ENDED);

    else if(GetWinPattern(challenge.tabel, 'X') || GetWinPattern(challenge.tabel, 'O'))
    {
        DeleteChallenge(challenge, DeleteReason.ENDED);
        var winner: User = GetWinPattern(challenge.tabel, 'X') ? challenge.xUser : challenge.zeroUser; 
        interaction.reply(`🎉 Kaboom! We have a winner: ${winner} (**+${challenge.coins}** coins).`)
    
        var userData = await Database.instance.GetUser(challenge.propose.id);
        var targetData = await Database.instance.GetUser(challenge.target.id);
        if(userData.coins < challenge.coins)
            interaction.reply(`${challenge.propose} doesn t have that amount of coins but still it will be charged.`);
        
        else if(targetData.coins < challenge.coins)
            interaction.reply(`${challenge.target} doesn t have that amount of coins but still it will be charged.`);
        
        if(winner === challenge.propose)
        {
            userData.coins += challenge.coins;
            targetData.coins -= challenge.coins;
        }
        else {
            userData.coins -= challenge.coins;
            targetData.coins += challenge.coins;        
        }
        
        setTimeout(async () => {
            // await challenge.message.delete();
        }, 2000);
    }
    else interaction.deferUpdate();
});
