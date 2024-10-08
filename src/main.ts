import {Client, GatewayIntentBits, Interaction} from "discord.js";
import env from 'dotenv'
env.config();

export const client: Client = new Client({intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        // GatewayIntentBits.
        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent
     ]});

client.on('ready', () => {
    console.log(`[BOT] Ready.`);    
    
    // ================== client-RELATED IMPORTS ================= //
    import('./activity');

});

import { CommandManager } from "./managers/commands/main";
CommandManager.instance.Init();

client.login(process.env.TOKEN!);

import './managers/database/connection';
import './managers/events/main'
import './managers/challenges/main';
import './managers/music/main';

import './managers/logs/main';
import './managers/charts/main';