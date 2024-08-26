import { client } from "../../../main";
import db from "../../database/connection";
import { Database } from "../../database/manager";
import { DELETE_ACCOUNT_AFTER_LEFT_MS, UserDb } from "../../database/tabels/users";

export const UPDATE_CHECK_DELETION = 3600*1000;

// this script cleans database of inactive users that left server.
client.on('ready', () => {
    setInterval(() => {
        db.query('select * from users', [], (err, res: any) => {
            if(err)
            {
                console.log(err);
                return;
            }
            res = res as Array<UserDb>;
            res.forEach(async (user: UserDb) => {
                if(user.deleteTimestamp !== 'null' && Date.now() - parseInt(user.deleteTimestamp) > 0)
                {
                    console.log('Deleting user' + user.discordId + " due to inactivity.");
                    await Database.instance.DeleteUser(user.discordId);
                }
            });
        })
    }, DELETE_ACCOUNT_AFTER_LEFT_MS);
});