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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const connection_1 = __importDefault(require("../../database/connection"));
main_1.CommandManager.instance.Register(new main_1.Command('ping', 'o iubesc', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    yield interaction.reply('pong');
    if (interaction.options.data.length > 0)
        console.log(interaction.options.data.at(0).value);
    connection_1.default.query('select * from users where discordId=? AND guildId=?', [interaction.user.id, interaction.guild.id], (err, res) => {
        if (err)
            throw err;
    });
}), [new main_1.Argument(main_1.ArgumentType.INTEGER, "test", 'desc', false)]));
