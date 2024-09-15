import { Events, GuildMember, PartialGuildMember, PartialUser, User } from "discord.js";
import { client } from "../../../main";
import { Database } from "../../database/manager";
import { UserDb } from "../../database/tabels/users";

client.on(Events.GuildMemberUpdate, (async(o, n) => await UpdateUser(o,n)));
client.on(Events.UserUpdate, (async(o, n) => await UpdateUser(o,n)));

async function UpdateUser(o: GuildMember | PartialGuildMember | User | PartialUser, n :GuildMember | User) {
    var users = await Database.instance.GetUserData(o.id) as Array<UserDb>;
    console.log(n);
    console.log(users);
    users.map((async(user) => {
        user.avatar = n.displayAvatarURL();
        // console.log();
        user.name = n.displayName;
        await Database.instance.UpdateUser(user);
    }));
}