import db from "../database/connection";

export type LogType = 'chat' | 'kick' | 'ban'; 

export class Log {
    public id: number;
    public type: LogType;
    public content: string;
    public guildId: string;
    public authorId: string;
    public channelId: string;
    constructor(type: LogType, content: string, channelId: string, guildId: string, authorId: string) {
        this.type = type;
        this.content = content;
        this.channelId = channelId;
        this.guildId = guildId;
        this.authorId = authorId;
    }
}

export class LogManager {
    static #instance: LogManager = null;

    private constructor() {}

    public static get instance(): LogManager {
        if(!this.#instance)
            this.#instance = new LogManager();

        return this.#instance;
    }

    public InsertLog(log: Log) {
        db.query('insert into logs (type, content, channelId, guildId, authorId) values (?,?,?, ?,?)', [log.type, log.content, log.channelId, log.guildId, log.authorId], (err, res) => {
            if(err)
            {
                console.error(err);
                return;        
            } 
        });
        console.log(`[Log] ${log.content}`);
    }
}
import './messageCreate';