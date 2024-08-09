import { Interaction } from "discord.js";
import { client } from "../../main";
import db from "./connection";

client.on('interactionCreate', (interaction: Interaction) => {
    if(!interaction.isCommand())
        return;

    InsertUserIfNotExists(interaction.user.id, parseInt(interaction.guild.id));
});

export async function InsertUserIfNotExists(discord_id: String, guild_id: Number= parseInt(process.env.GUILD_ID)): Promise<void> {
    db.query('select discordId from users where discordId=? AND guildId=?', [discord_id, guild_id], (err, res) => {
        if(err)
            throw err;
        
        if(res[0] === undefined)
        {
            return new Promise<void>(_ => {
                db.query('insert into users (discordId, guildId) values (?, ?)', [discord_id, guild_id], (err, _) => {
                    if(err)
                        throw err;
    
                    console.log(`[DB] ${discord_id} (guild_id ${guild_id}) is not registered in database, i'm adding him.`);
                });
            })
        }
    });
}