import { Events, Message } from "discord.js";
import { client } from "../../main";
import { Log, LogManager } from "./main";

client.on(Events.MessageCreate, (message: Message) => {
    LogManager.instance.InsertLog(new Log('chat', `${message.author.displayName}: ${message.content}`, message.channelId, message.guild.id, message.author.id));

});