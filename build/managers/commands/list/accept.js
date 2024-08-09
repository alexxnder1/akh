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
const main_1 = require("../main");
const coinflip_1 = require("./coinflip");
main_1.CommandManager.instance.Register(new main_1.Command('accept', 'Accept various challanges', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var type = interaction.options.data.at(0);
    var money = interaction.options.data.at(1);
    if (coinflip_1.challenges.find(c => c.guildId === parseInt(interaction.guild.id) && parseInt(c.target.id) === parseInt(interaction.user.id)) === undefined) {
        yield interaction.reply("That user didn't send any challenge to you.");
        return;
    }
    if (type.value === 'coinflip')
        (0, coinflip_1.OnCoinflipAccept)(interaction, coinflip_1.challenges.find(c => c.target.id === interaction.user.id));
}), [new main_1.Argument(main_1.ArgumentType.STRING, 'type', 'coinflip/etc', true), new main_1.Argument(main_1.ArgumentType.USER, 'user', 'user you want to accept from', true)]));
