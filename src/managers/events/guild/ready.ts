import { client } from "../../../main";
import { Database } from "../../database/manager";
import { EventManager, Events } from "../emitter";
import { GuildManager } from "../main";

client.on('ready', async() => {
    try {
        for(const guild of client.guilds.cache.values()) {
            await GuildManager.instance.SetupGuild(guild);
            
            const members = await guild.members.fetch();
            members.forEach((member) => {
                // if not exists
                if(!member.user.bot)
                    Database.instance.SetupUser(member.user.id, guild.id);
            }); 
        }
        EventManager.instance.RegisterEmitter(Events.GuildManagerValidate);
    } catch(err) {
        console.error(err);
    }
});