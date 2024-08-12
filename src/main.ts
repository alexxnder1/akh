import {Client, GatewayIntentBits, Interaction} from "discord.js";
import env from 'dotenv'
env.config();

export const client: Client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers]});

import { Command, CommandManager } from "./managers/commands/main";

client.on('ready', () => {
    console.log(`[BOT] Ready.`);    
    
    // ================== client-RELATED IMPORTS ================= //
    import('./activity');

});

CommandManager.instance.Init();

client.login(process.env.TOKEN!);

import './managers/database/connection';
import './managers/events/main'