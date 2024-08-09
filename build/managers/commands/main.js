"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _CommandManager_instance;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = exports.Command = exports.Argument = exports.ArgumentType = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const main_1 = require("../../main");
var ArgumentType;
(function (ArgumentType) {
    ArgumentType[ArgumentType["STRING"] = 3] = "STRING";
    ArgumentType[ArgumentType["INTEGER"] = 4] = "INTEGER";
    ArgumentType[ArgumentType["BOOLEAN"] = 5] = "BOOLEAN";
    ArgumentType[ArgumentType["USER"] = 6] = "USER";
    ArgumentType[ArgumentType["CHANNEL"] = 7] = "CHANNEL";
    ArgumentType[ArgumentType["ROLE"] = 8] = "ROLE";
    ArgumentType[ArgumentType["MENTIONABLE"] = 9] = "MENTIONABLE";
    ArgumentType[ArgumentType["NUMBER"] = 10] = "NUMBER";
    ArgumentType[ArgumentType["ATTACHMENT"] = 11] = "ATTACHMENT";
})(ArgumentType || (exports.ArgumentType = ArgumentType = {}));
class Argument {
    constructor(type, name, description, required) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.required = required;
    }
}
exports.Argument = Argument;
class Command {
    constructor(name, desc, func, arg) {
        this.name = name;
        this.description = desc;
        this.execute = func;
        this.options = arg;
    }
}
exports.Command = Command;
class CommandManager {
    constructor() {
        this.commands = [];
    }
    static get instance() {
        if (!__classPrivateFieldGet(_a, _a, "f", _CommandManager_instance))
            __classPrivateFieldSet(_a, _a, new _a(), "f", _CommandManager_instance);
        return __classPrivateFieldGet(_a, _a, "f", _CommandManager_instance);
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.TOKEN);
            try {
                for (let i = 0; i < 25; i++)
                    console.log(' \n');
                console.log('Started refreshing application (/) commands.');
                var files = fs_1.default.readdirSync('src/managers/commands/list');
                const importPromises = files.map(file => {
                    return Promise.resolve(`${'./list/' + file.split('.ts')[0]}`).then(s => __importStar(require(s)));
                });
                yield Promise.all(importPromises);
                yield rest.put(discord_js_1.Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: this.commands.map((_b) => {
                        var { execute } = _b, rest = __rest(_b, ["execute"]);
                        return rest;
                    }) });
                _a.instance.commands.forEach(cmd => {
                    main_1.client.on('interactionCreate', (interaction) => {
                        if (interaction.isCommand())
                            if (interaction.commandName === cmd.name)
                                cmd.execute(interaction);
                    });
                });
                console.log('Successfully reloaded application (/) commands.');
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    Register(cmd) {
        this.commands.push(cmd);
    }
}
exports.CommandManager = CommandManager;
_a = CommandManager;
_CommandManager_instance = { value: null };
