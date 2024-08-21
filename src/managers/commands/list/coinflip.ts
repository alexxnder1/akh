import { CommandInteraction, EmbedBuilder, escapeHeading, TextChannel, ThreadChannel, User } from "discord.js";
import { Argument, ArgumentType, Command, CommandManager } from "../main";
import db from "../../database/connection";
import { Database } from "../../database/manager";
import { GetPercent } from "../../../utils/math";
import { Challenge, challenges, IsUserInChallenge, IsUserProvokedBy } from "../../challenges/main";
import { Coinflip } from "../../challenges/coinflip";

// seconds
const EXPIRE_TIME: number = 17;

CommandManager.instance.Register(new Command('coinflip', 'challenge someone and earn coins', async (interaction: CommandInteraction) => {
    var user = interaction.options.data.at(0);
    var money = interaction.options.data.at(1);

    if(user.user.id === interaction.user.id)
        return await interaction.reply({ephemeral: true, content: 'You cannot challenge yourself'});

    if(IsUserProvokedBy(interaction.user.id, user.user.id, interaction.guild.id, Coinflip))
        return await interaction.reply({content: `You already provoked <@${user.user.id}>` , ephemeral: true})

    if(IsUserInChallenge(user.user.id, interaction.guild.id, Coinflip))
    {
        await interaction.reply({content: 'User is already in a challenge', ephemeral: true});
        return;
    }

    if(money.value as number <= 0)
    {
        await interaction.reply({content: 'Invalid bet amount.', ephemeral: true});
        return; 
    }

    // else if()
    else {
        const userData = await Database.instance.GetUser(interaction.user.id);
        const targetData = await Database.instance.GetUser(user.user.id);    
        // console.log(targetData.discordId );
            
        if(userData.coins < (money.value as number))
            return await interaction.reply({content: 'Insufficent coins. You only have `' + userData.coins + "`.", ephemeral: true});

        if(targetData.coins < (money.value as number))
            return await interaction.reply({content: "User <@" + targetData.discordId + "> doesnt have that amount of coins.", ephemeral: true});

        var chal: Challenge = new Coinflip(interaction.user, user.user, money.value as number, interaction.guild.id);
        const embed= new EmbedBuilder()
            .setColor(0x5BDE1A)
            .setTitle('Coinflip #' + challenges.indexOf(chal))
            .setDescription('   ')
            .addFields(
                { name: 'Propose', value: `${chal.propose}\n`, inline:true },
                { name: 'Target', value: `${chal.target}`, inline:true },
            
                { name: '\n', value: '  ' },

                { name: 'Coins', value: '🪙 `' + userData.coins + '`', inline:true },
                { name: 'Coins', value: '🪙 `' + targetData.coins + '`', inline:true },
                { name: '\n', value: '  ' },
                { name: '\n', value: '  ' },

                { name: `Wins (${GetPercent(userData.coinflipWins, userData.totalCoinflips)}%) - Loss (${userData.coinflipLoss, userData.totalCoinflips}%)`, value: `✅ ${userData.coinflipWins} - ${userData.coinflipLoss} ❌`, inline:true },
                { name: `Wins (${GetPercent(targetData.coinflipWins, targetData.totalCoinflips)}%) - Loss (${targetData.coinflipLoss, targetData.totalCoinflips}%)`, value: `✅ ${targetData.coinflipWins} - ❌ ${targetData.coinflipLoss}`, inline:true },
                { name: '\n', value: '  ' },

                { name: '`Total Coinflips`', value: `${userData.totalCoinflips}`, inline:true },
                { name: '`Total Coinflips`', value: `${targetData.totalCoinflips}`, inline:true },
            )
            .setTimestamp()
            .setFooter({text: `Expires at ${EXPIRE_TIME} seconds`})

        const msg = await interaction.channel.send({embeds:[embed]});
        const eph = await interaction.reply({content: `You provoked **${user.user.username}** to a coinflip challeange for a bet of **${chal.coins}**!`, ephemeral: true});
        setTimeout(() => {
            eph.edit(`The challenge with ${chal.propose} has expired.`);
            challenges.splice(challenges.indexOf(chal), 1);
            msg.delete();
        }, EXPIRE_TIME*1000);
    }

}, [new Argument(ArgumentType.USER, "user", 'the user you want to get money from', true), new Argument(ArgumentType.INTEGER, "amount", 'amount of coins', true)]));

export async function OnCoinflipAccept(interaction: CommandInteraction, chal: Challenge) {
    chal.started = true;
    const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`Reversing the coin...`)
    .setImage('https://cdn.dribbble.com/users/12524477/screenshots/18860746/media/34c431d2ce3d5d9734c1b8ffac98a698.gif');

    var message = await interaction.channel.send({content: `Coinflip between ${interaction.user} and ${chal.propose}`, embeds: [embed]});

    setTimeout(async() => {
        let random = Math.random();
        var winner: User, looser:User;

        if(random > 0 && random <= 0.5)
        {
            winner = chal.propose;    
            looser = chal.target;
        }
        else {
            winner = chal.target;
            looser = chal.propose;
        }        
        var winnerData = await Database.instance.GetUser(winner.id);
        var looserData = await Database.instance.GetUser(looser.id);
        winnerData.coins += chal.coins;
        looserData.coins -= chal.coins;
        winnerData.totalCoinflips++;
        looserData.totalCoinflips++;     
        winnerData.coinflipWins ++;
        looserData.coinflipLoss++;               

        const summary = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Coinflip between ${interaction.user.username} and ${chal.propose.username}`) 
            .addFields(
                { name: '✔️ Winner (+' + chal.coins + ')', value: `${winner}`, inline:true },
                { name: '❌ Looser (-' + chal.coins +')', value: `${looser}`, inline:true },
                
            )
            .setTimestamp()
            
        message.edit({content: '', embeds: [summary]});
        // setTimeout(() => {
        //     thread.delete();
        // }, 8000);
    }, 5000);
}