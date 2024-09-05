import { CommandInteraction, Interaction, REST, Routes } from "discord.js";
import fs, { promises } from 'fs';
import { client } from "../../main";
import { Database } from "../database/manager";
import db from "../database/connection";
import { Command } from "../database/tabels/commands";

export var rest: REST = null;

export class CommandManager {
    commands: Array<Command> = [];
    static #instance: CommandManager = null;

    private constructor() {}

    public static get instance(): CommandManager {
        if(!CommandManager.#instance)
            CommandManager.#instance = new CommandManager();

        return CommandManager.#instance;
    }
    async Init(): Promise<void> {
        rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

        try {
            for(let i = 0; i <25; i++)
                console.log(' \n');
            
            // console.log('Started refreshing application (/) commands.');
            var files = fs.readdirSync('src/managers/commands/list');

            const importPromises = files.map(file => {
                return import('./list/' + file.split('.ts')[0]);
            });

            await Promise.all(importPromises);
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!), { body: this.commands.map(({execute,...rest}) => rest)});
            
            CommandManager.instance.commands.forEach(cmd => {
                client.on('interactionCreate', (interaction: Interaction) => {
                    if(interaction.isCommand())
                        if(interaction.commandName === cmd.name)
                            cmd.execute(interaction as CommandInteraction);
                });
            });    
            db.query('delete from commands', (err, _) => {
                if(err)
                    console.error(err);

                CommandManager.instance.commands.forEach(cmd => {
                    db.query('insert into commands (name,description,options) values(?,?,?)', [cmd.name, cmd.description, JSON.stringify(cmd.options)], (err, res) => {
                        if(err)
                            console.error(err);
                    })
                });
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    Register(cmd: Command) {
        this.commands.push(cmd);
    }
}