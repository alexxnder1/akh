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
const discord_js_1 = require("discord.js");
const main_1 = require("../main");
const user_cache_1 = require("../../database/user-cache");
const math_1 = require("../../../utils/math");
main_1.CommandManager.instance.Register(new main_1.Command('stats', 'See your statistics', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield user_cache_1.Database.instance.GetUser(interaction.user.id);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Your statistics')
        .setDescription('Look! Here are all of your stats.')
        .addFields({ name: 'Coinflip', value: ' ' }, { name: '`Coins`', value: '`' + data.coins + '`', inline: true }, { name: '`Total Coinflips`', value: '`' + data.totalCoinflips + '`', inline: true }, { name: '\u200B', value: '\u200B', inline: true }, { name: "`Wins " + (0, math_1.GetPercent)(data.coinflipWins, data.totalCoinflips) + "%`", value: '`' + data.coinflipWins + '`', inline: true }, { name: "`Loss " + (0, math_1.GetPercent)(data.coinflipLoss, data.totalCoinflips) + "%`", value: '`' + data.coinflipLoss + '`', inline: true }, { name: '===========================', value: ' ' })
        .setTimestamp();
    yield interaction.reply({ embeds: [embed], ephemeral: true });
}), []));
