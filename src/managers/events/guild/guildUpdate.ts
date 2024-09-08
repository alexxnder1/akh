import { Events } from "discord.js";
import { client } from "../../../main";
import { GuildManager } from "../main";

client.on(Events.GuildUpdate, ((o, n)=> {
   GuildManager.instance.SetupGuild(o, n);
}));