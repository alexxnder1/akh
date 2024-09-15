import { Guild, GuildMember } from "discord.js";
import { client } from "../../main";
import { GetDateByTimestamp } from "../../utils/date";
import db from "../database/connection";
import { GuildManager } from "../events/main";
import { EventManager, Events } from "../events/emitter";
import { GuildDb } from "../database/tabels/guilds";

export class UserChart {
    public names: Array<string>;
    public date: number;
    public guildId: string;

    // constructor(names: Array<string>, date: number, guildId: string) {
    //     this.names = names;
    //     this.date = date;
    //     this.guildId = guildId;
    // }
}

export class Charts {
    users: Array<UserChart> = [];
} 

export class ChartManager {
    static #instance: ChartManager = null;

    public charts: Charts = null;

    public static get instance(): ChartManager {
        if(!this.#instance)
        {
            this.#instance = new ChartManager();
            this.#instance.charts = new Charts();
        }
        return this.#instance;
    }

    public async AddGuildData(guild: GuildDb) {
        var chart = new UserChart();
        
        var res = await guild.GetMembers();
        var users = [];
    
        res.map((val: GuildMember) => {
            // if(val)
            users.push(val.user.displayName);
        })

        chart.names = users;
        chart.date = Date.now();
        chart.guildId = guild.guildId.toString();
                    
        db.query('insert into user_charts (names, date, guildId) values (?, ?, ?)', [JSON.stringify(chart.names), chart.date, guild.guildId], async (err, res) => {
            if(err)
                console.error(err);

            console.log(`[User Charts] Added chart value of ${chart.names.length} users at ${GetDateByTimestamp(chart.date)}.`);
        })
    }

    public CheckForNullData() {
        GuildManager.instance.guilds.forEach(async (guild, _) => {
            this.AddGuildData(guild);  
        });
    }
}

EventManager.instance.AddListener(Events.GuildManagerValidate, () => {
    ChartManager.instance.CheckForNullData();
});