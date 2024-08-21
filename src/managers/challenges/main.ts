import { ButtonInteraction, CommandInteraction, Interaction, InteractionResponse, Message, User } from "discord.js";
import { Coinflip } from "./coinflip";
import { TicTacToe } from "./tic-tac-toe";

export class Challenge {
    public propose: User;
    public target: User;
    public coins: number;
    public guildId: string;
    public started:boolean = false;
    public message: Message;

    constructor(propose: User, target: User, money: number, guildId: string) {
        this.propose = propose;
        this.target =target;
        this.coins = money;
        this.guildId = guildId;
        challenges.push(this);
    }
}


export function IsUserInChallenge(id: string, guildId: string, cType: any): boolean {
    return challenges.findIndex(v => v instanceof cType && (v.propose.id === id || v.target.id === id) && v.guildId.toString() === guildId && v.started) != -1 ? true : false;
}


export function IsUserProvokedBy(id: string, by: string, guildId: string, cType: any): boolean {
    return challenges.findIndex(v => v instanceof cType && (v.propose.id === by || v.target.id === id) && v.guildId.toString() === guildId) != -1 ? true : false;
}

export function GetUserInChallenge(userId: string, guildId: string, cType: any): Challenge {
    return challenges.find(v => v instanceof cType && (v.propose.id === userId || v.target.id === userId) && v.guildId.toString() === guildId);
}


export var challenges: Array<Challenge> = [];