import { Events } from "discord.js";
import { client } from "../../../main";
import { Database } from "../../database/manager";

client.on(Events.GuildMemberUpdate, (async(o, n) => {
    // if(o.)
    var user = await Database.instance.GetUser(o.id, o.guild.id);
    user.avatar = n.displayAvatarURL();
    user.name = n.user.username;
    await Database.instance.UpdateUser(user);
}));