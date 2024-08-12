import { CommandInteraction, Interaction, REST, Routes } from "discord.js";
import fs, { promises } from 'fs';
import { client } from "../../main";

export enum ArgumentType {
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER =6,
    CHANNEL =7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11
}

export class Argument {
    public type: ArgumentType;
    public name: string;
    public description: string;
    public required?: boolean | true;

    constructor(type: ArgumentType, name: string, description: string, required?: boolean | true)
    {
        this.type = type;
        this.name = name;
        this.description = description;
        this.required = required;
    }
}

export class Command {
    public name: string;
    public description: string;
    public execute: Function;
    public options : Array<Argument>;

    constructor(name: string, desc: string, func: Function, arg: Array<Argument>) {
        this.name = name;
        this.description = desc;
        this.execute = func;
        this.options = arg;
    }
}

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
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

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
            // console.log('Successfully reloaded application (/) commands.');
        }
        catch (error) {
            console.error(error);
        }
    }

    Register(cmd: Command) {
        this.commands.push(cmd);
    }
}