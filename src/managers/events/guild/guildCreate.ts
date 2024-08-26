import { Events, Guild } from "discord.js";
import { client } from "../../../main";
import { GuildManager } from "../main";

client.on(Events.GuildCreate, (guild: Guild) => {
    console.log('da');
    GuildManager.instance.AddGuild(guild);
});