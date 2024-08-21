import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, escapeHeading, Events, Interaction, User } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager } from "../main";
import { challenges, GetUserInChallenge, IsUserInChallenge, IsUserProvokedBy } from "../../challenges/main";
import { Database } from "../../database/manager";
import { client } from "../../../main";
import { GetWinPattern, TicTacToe } from "../../challenges/tic-tac-toe";

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
    challenges.push(chal);
    interaction.reply({ephemeral: true, content: `You provoked ${user} for ${bet}.`});
    challenges.splice(challenges.indexOf(chal), 1);

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
            console.log(i + " " + j);
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${i}, ${j}`)
                    .setLabel('-')
                    .setStyle(ButtonStyle.Primary)
            )
        }
        rows.push(row)         
    }
    challenge.message = await interaction.channel.send({content: `${challenge.xUser} - ❌\n${challenge.zeroUser} - 🅾`, components: rows});
    interaction.reply({ephemeral:true, content: `You accepted ${target}'s tic-tac-toe challenge for ${challenge.coins}.`});
}

client.on(Events.InteractionCreate, (interaction: Interaction) => {
    if(!interaction.isButton())
        return;

    if(!interaction.message)
        return;
    
    var challenge = challenges.find(c => c.message.id === (interaction as any).message.id) as TicTacToe;
    if(GetUserInChallenge(interaction.user.id, interaction.guild.id, TicTacToe) != challenge)
        return interaction.reply({content: 'You are not in that challenge.', ephemeral: true});    
    
    interaction = interaction as ButtonInteraction;
    if(challenge.turnUser !== interaction.user)
        return interaction.deferUpdate();  
    
    let matrixI:number = parseInt(interaction.customId.split(", ")[0]);
    let matrixJ:number = parseInt(interaction.customId.split(", ")[1]);
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
                    .setCustomId(`${i}, ${j}`)
                    .setLabel(label)
                    .setStyle(btn)
            )
        }
        rows.push(row)         
    }
    challenge.message.edit({content: `${challenge.xUser} - ❌\n${challenge.zeroUser} - 🅾`, components: rows})
    challenge.turnUser = challenge.turnUser === challenge.propose ? challenge.target : challenge.propose;
    
    if(GetWinPattern(challenge.tabel, 'X') || GetWinPattern(challenge.tabel, 'O'))
        {
        var test = challenges.splice(challenges.indexOf(challenge), 1);
        console.log(test);
        var winner: User = GetWinPattern(challenge.tabel, 'X') ? challenge.xUser : challenge.zeroUser; 
        interaction.reply(`🎉 Kaboom! We have a winner: ${winner} (**+${challenge.coins}** coins).`)
        setTimeout(async () => {
            // await challenge.message.delete();
        }, 2000);
    }
    else interaction.deferUpdate();
});
