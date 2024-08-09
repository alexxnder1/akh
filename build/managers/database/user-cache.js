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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _Database_instance;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.DatabaseCache = exports.UserDb = void 0;
const main_1 = require("../../main");
const connection_1 = __importDefault(require("./connection"));
const userAutoRegistration_1 = require("./userAutoRegistration");
class UserDb {
}
exports.UserDb = UserDb;
class DatabaseCache {
    constructor() {
        this.users = [];
    }
}
exports.DatabaseCache = DatabaseCache;
class Database {
    constructor() {
        this.cache = null;
        this.intervals = [];
    }
    static get instance() {
        if (!__classPrivateFieldGet(_a, _a, "f", _Database_instance)) {
            __classPrivateFieldSet(_a, _a, new _a(), "f", _Database_instance);
            __classPrivateFieldGet(_a, _a, "f", _Database_instance).cache = new DatabaseCache();
        }
        return __classPrivateFieldGet(_a, _a, "f", _Database_instance);
    }
    SetUpdateCachedValuesInterval() {
        this.intervals.forEach(int => clearInterval(int));
        this.intervals = [];
        var count = 0;
        main_1.client.guilds.fetch().then(guilds => {
            guilds.forEach(guild => {
                var int = setInterval(() => {
                    this.cache.users.forEach((user, id) => {
                        connection_1.default.query(`update users set ? where ?`, [user, { discordId: user.discordId, guildId: guild.id }], (err, res) => {
                            if (err)
                                throw err;
                            console.log(`[Cache] Updated ${res['affectedRows']} values for ${user.discordId} (${guild.name}).`);
                        });
                    });
                }, (count + 1) * parseInt(process.env.UPDATE_CACHE_TO_DB) * 1000);
                this.intervals.push(int);
                count++;
            });
        });
    }
    RemoveCache(discord_id) {
        var user = this.cache.users.findIndex(d => d.discordId === discord_id);
        if (user != -1) {
            this.cache.users.splice(user, 1);
            console.log('Removed cache for user ' + discord_id);
        }
        else
            console.log(`Cannot remove cache for ${discord_id}.`);
    }
    GetUser(discord_id_1) {
        return __awaiter(this, arguments, void 0, function* (discord_id, guild_id = parseInt(process.env.DEBUG_GUILD_ID)) {
            yield (0, userAutoRegistration_1.InsertUserIfNotExists)(discord_id);
            try {
                var user = this.cache.users.find(d => parseInt(discord_id) === d.discordId);
                if (user) {
                    return user;
                }
                else {
                    return new Promise(resolve => {
                        connection_1.default.query('select * from users where discordId=? and guildId=?', [discord_id, guild_id], (err, res) => {
                            if (err)
                                throw err;
                            if (res[0] !== undefined) {
                                var userDb = new UserDb();
                                // userDb.discordId = parseInt(discord_id);
                                // userDb.coinflipLoss = res[0].coinflipLoss;
                                // userDb.coinflipWins = res[0].coinflipWins;
                                // userDb.coins = res[0].coins;
                                // userDb.lossRate = res[0].lossRate;
                                // userDb.totalCoinflips = res[0].totalCoinflips;
                                // userDb.winRate = res[0].winRate;
                                userDb = res[0];
                                console.log(`[DB Cache] Cache created for user ${discord_id}.`);
                                this.cache.users.push(userDb);
                                resolve(userDb);
                            }
                            else {
                                console.log('it s not created');
                                resolve(null);
                            }
                        });
                    });
                }
            }
            catch (err) {
                console.error(err);
            }
        });
    }
}
exports.Database = Database;
_a = Database;
_Database_instance = { value: null };
main_1.client.on('guildMemberRemove', (member) => {
    Database.instance.RemoveCache(parseInt(member.id));
});
Database.instance.SetUpdateCachedValuesInterval();
