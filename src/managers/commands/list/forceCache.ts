import { CommandInteraction, User } from "discord.js";
import { Database } from "../../database/manager";
import {  Argument, ArgumentType, Command } from "../../database/tabels/commands";
import { CommandManager } from "../main";

CommandManager.instance.Register(new Command('forcecache', 'force cache to be updated from db', async(interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        var user: User = interaction.options.data.at(0).user;
        Database.instance.UpdateCacheFromDb(user.id, interaction.guild.id);
        interaction.editReply(`Cache updated from DB for user ${user.displayName}.`);        
        // console
    }
    catch(err) {
        interaction.editReply(`Cannot update cache from db for user ${user.displayName}`);
    } 

}, [new Argument(ArgumentType.MENTIONABLE, 'user', 'user you want to force cache')]));