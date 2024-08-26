import { Events, Message } from "discord.js";
import { client } from "../../main";
import { Log, LogManager } from "./main";

client.on(Events.MessageCreate, (message: Message) => {
    console.log(message.content);
    LogManager.instance.InsertLog(new Log('chat', message.content, message.channelId, message.guild.id));
});