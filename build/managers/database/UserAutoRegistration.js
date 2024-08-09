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
exports.InsertUserIfNotExists = InsertUserIfNotExists;
const main_1 = require("../../main");
const connection_1 = __importDefault(require("./connection"));
main_1.client.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand())
        return;
    InsertUserIfNotExists(interaction.user.id, parseInt(interaction.guild.id));
});
function InsertUserIfNotExists(discord_id_1) {
    return __awaiter(this, arguments, void 0, function* (discord_id, guild_id = parseInt(process.env.GUILD_ID)) {
        connection_1.default.query('select discordId from users where discordId=? AND guildId=?', [discord_id, guild_id], (err, res) => {
            if (err)
                throw err;
            if (res[0] === undefined) {
                return new Promise(_ => {
                    connection_1.default.query('insert into users (discordId, guildId) values (?, ?)', [discord_id, guild_id], (err, _) => {
                        if (err)
                            throw err;
                        console.log(`[DB] ${discord_id} (guild_id ${guild_id}) is not registered in database, i'm adding him.`);
                    });
                });
            }
        });
    });
}
