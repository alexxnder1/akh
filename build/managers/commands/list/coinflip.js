"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.challenges = void 0;
exports.OnCoinflipAccept = OnCoinflipAccept;
const discord_js_1 = require("discord.js");
const main_1 = require("../main");
const user_cache_1 = require("../../database/user-cache");
const math_1 = require("../../../utils/math");
// seconds
const EXPIRE_TIME = 17;
class Challenge {
    constructor(propose, target, money, guildId) {
        this.started = false;
        this.propose = propose;
        this.target = target;
        this.coins = money;
        this.guildId = guildId;
        exports.challenges.push(this);
    }
}
exports.challenges = [];
main_1.CommandManager.instance.Register(new main_1.Command('coinflip', 'Challange someone and earn coins', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    var user = interaction.options.data.at(0);
    var money = interaction.options.data.at(1);
    if (user.user.id === interaction.user.id)
        return yield interaction.reply({ ephemeral: true, content: 'You cannot challenge yourself' });
    if (exports.challenges.find(v => v.propose.id === interaction.user.id && v.target.id === user.user.id))
        return yield interaction.reply({ content: `You already provoked <@${user.user.id}>`, ephemeral: true });
    if ((_a = exports.challenges.find(v => parseInt(v.target.id) === parseInt(user.user.id) || parseInt(v.propose.id) === parseInt(user.user.id))) === null || _a === void 0 ? void 0 : _a.started) {
        yield interaction.reply({ content: 'User is already in a challenge', ephemeral: true });
        return;
    }
    if (money.value <= 0) {
        yield interaction.reply({ content: 'Invalid bet amount.', ephemeral: true });
        return;
    }
    // else if()
    else {
        const userData = yield user_cache_1.Database.instance.GetUser(interaction.user.id);
        const targetData = yield user_cache_1.Database.instance.GetUser(user.user.id);
        // console.log(targetData.discordId );
        if (userData.coins < money.value)
            return yield interaction.reply({ content: 'Insufficent coins. You only have `' + userData.coins + "`.", ephemeral: true });
        if (targetData.coins < money.value)
            return yield interaction.reply({ content: "User <@" + targetData.discordId + "> doesnt have that amount of coins.", ephemeral: true });
        var chal = new Challenge(interaction.user, user.user, money.value, parseInt(interaction.guild.id));
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x5BDE1A)
            .setTitle('Coinflip #' + exports.challenges.indexOf(chal))
            .setDescription('   ')
            .addFields({ name: 'Propose', value: `${chal.propose}\n`, inline: true }, { name: 'Target', value: `${chal.target}`, inline: true }, { name: '\n', value: '  ' }, { name: 'Coins', value: '🪙 `' + userData.coins + '`', inline: true }, { name: 'Coins', value: '🪙 `' + targetData.coins + '`', inline: true }, { name: '\n', value: '  ' }, { name: '\n', value: '  ' }, { name: `Wins (${(0, math_1.GetPercent)(userData.coinflipWins, userData.totalCoinflips)}%) - Loss (${userData.coinflipLoss, userData.totalCoinflips}%)`, value: `✅ ${userData.coinflipWins} - ${userData.coinflipLoss} ❌`, inline: true }, { name: `Wins (${(0, math_1.GetPercent)(targetData.coinflipWins, targetData.totalCoinflips)}%) - Loss (${targetData.coinflipLoss, targetData.totalCoinflips}%)`, value: `✅ ${targetData.coinflipWins} - ❌ ${targetData.coinflipLoss}`, inline: true }, { name: '\n', value: '  ' }, { name: '`Total Coinflips`', value: `${userData.totalCoinflips}`, inline: true }, { name: '`Total Coinflips`', value: `${targetData.totalCoinflips}`, inline: true })
            .setTimestamp()
            .setFooter({ text: `Expires at ${EXPIRE_TIME} seconds` });
        const msg = yield interaction.channel.send({ embeds: [embed] });
        const eph = yield interaction.reply({ content: `You provoked **${user.user.username}** to a coinflip challeange for a bet of **${chal.coins}**!`, ephemeral: true });
        setTimeout(() => {
            eph.edit(`The challenge with ${chal.propose} has expired.`);
            exports.challenges.splice(exports.challenges.indexOf(chal), 1);
            msg.delete();
        }, EXPIRE_TIME * 1000);
    }
}), [new main_1.Argument(main_1.ArgumentType.USER, "user", 'the user you want to get money from', true), new main_1.Argument(main_1.ArgumentType.INTEGER, "amount", 'amount of coins', true)]));
function OnCoinflipAccept(interaction, chal) {
    return __awaiter(this, void 0, void 0, function* () {
        chal.started = true;
        var threadName = `Coinflip between ${interaction.user.username} and ${chal.propose.username}`;
        interaction.channel.threads.cache.forEach(item => item.delete());
        yield interaction.channel.threads.create({ name: threadName });
        try {
            var thread = interaction.channel.threads.cache.find(x => x.name === threadName);
            // thread.
            if (thread) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Reversing the coin...`)
                    .setImage('https://cdn.dribbble.com/users/12524477/screenshots/18860746/media/34c431d2ce3d5d9734c1b8ffac98a698.gif');
                const message = yield thread.send({ embeds: [embed] });
                try {
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        let random = Math.random();
                        var winner, looser;
                        if (random > 0 && random <= 0.5) {
                            winner = chal.propose;
                            looser = chal.target;
                        }
                        else {
                            winner = chal.target;
                            looser = chal.propose;
                        }
                        message.edit({ content: `${winner} won ${chal.coins} coins.`, embeds: [] });
                        var winnerData = yield user_cache_1.Database.instance.GetUser(winner.id);
                        var looserData = yield user_cache_1.Database.instance.GetUser(looser.id);
                        // test.coins = 9887742;
                        winnerData.coins += chal.coins;
                        looserData.coinflipLoss -= chal.coins;
                        winnerData.totalCoinflips++;
                        looserData.totalCoinflips++;
                        const summary = new discord_js_1.EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(`${thread.name}`)
                            .addFields({ name: '✔️ Winner', value: `${winner}`, inline: true }, { name: '❌ Looser', value: `${looser}`, inline: true })
                            .setTimestamp();
                        interaction.channel.send({ embeds: [summary] });
                        setTimeout(() => {
                            thread.delete();
                        }, 8000);
                    }), 5000);
                }
                catch (err) {
                    console.error(err);
                }
            }
            chal.thread = thread;
            yield interaction.reply(`<@${interaction.user.id}> accepted ${chal.propose}'s challange. Watch the coinflip: <#${thread.id}>`); // show thread
        }
        catch (err) {
            console.error(err);
            yield interaction.reply('Failed to create thread for coinflip challenge. Cancelling it.');
            exports.challenges = exports.challenges.splice(exports.challenges.indexOf(chal), 1);
            // challenges=challenges;
        }
    });
}
