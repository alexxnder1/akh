import { ButtonInteraction, CommandInteraction, Interaction, InteractionResponse, Message, User } from "discord.js";
import { Coinflip } from "./coinflip";
import { TicTacToe } from "./tic-tac-toe";

export const EXPIRE_TIME: number = 17*1000;
export const AUTO_DESTROY_CHALLENGE_TIME: number = 80*1000;

export class ChallengeManager {
    public challenges: Array<Challenge> = [];
    static #instance: ChallengeManager = null;
    public static get instance(): ChallengeManager {
        if(!ChallengeManager.#instance)
            ChallengeManager.#instance =  new ChallengeManager();

        return ChallengeManager.#instance;
    }

    public addChallenge(chal: Challenge) {
        this.challenges.push(chal);
    }

    public removeChallenge(chal: Challenge) {
        clearTimeout(chal.expireTimeout);
        clearTimeout(chal.autoDestroyTimeout);

        this.challenges.splice(this.challenges.indexOf(chal), 1);
        chal = null;
    }
}

export enum DeleteReason {
    EXPIRED,
    ENDED,
    REVOKED,
    OTHER
}

export class Challenge {
    public propose: User;
    public target: User;
    public coins: number;
    public guildId: string;
    public started:boolean = false;
    public message: Message;
    public expireTimeout: NodeJS.Timeout;
    public autoDestroyTimeout: NodeJS.Timeout;

    constructor(propose: User, target: User, money: number, guildId: string) {
        this.propose = propose;
        this.target =target;
        this.coins = money;
        this.guildId = guildId;
        ChallengeManager.instance.addChallenge(this);

        this.expireTimeout = setTimeout(() => {
            if(this.started)
            {
                clearTimeout(this.expireTimeout);
                this.expireTimeout = null;
            }

            else 
                DeleteChallenge(this, DeleteReason.EXPIRED)
            
        }, EXPIRE_TIME);

        this.autoDestroyTimeout = setTimeout(() => {
            DeleteChallenge(this, DeleteReason.EXPIRED);            
            this.autoDestroyTimeout = null;
        }, AUTO_DESTROY_CHALLENGE_TIME);
    }
}

export function CountChallangesOfType(type: any) {
    let count = 0;
    ChallengeManager.instance.challenges.forEach(chal => {
        if(chal instanceof type)
            count++;
    })

    return count;
}

export function DeleteChallenge(challenge: Challenge, expired:DeleteReason = DeleteReason.OTHER) {
    if(expired !== DeleteReason.ENDED && expired !== DeleteReason.REVOKED)
        challenge.message.channel.send(`The challenge between  ${challenge.target} and ${challenge.propose} has been removed.`);            

    challenge.message.delete(); 

   ChallengeManager.instance.removeChallenge(challenge);
}

export function IsUserInChallenge(id: string, guildId: string, cType: any): boolean {
    return ChallengeManager.instance.challenges.findIndex(v => v instanceof cType && (v.propose.id === id || v.target.id === id) && v.guildId.toString() === guildId && v.started) != -1 ? true : false;
}

// export function IsUserChallenge(id: string, guildId: string, cType: any): boolean {
//     return ChallengeManager.instance.challenges.findIndex(v => v instanceof cType && (v.propose.id === id || v.target.id === id) && v.guildId.toString() === guildId && v.started) != -1 ? true : false;
// }

export function IsUserProvokedBy(id: string, by: string, guildId: string, cType: any): boolean {
    return ChallengeManager.instance.challenges.findIndex(v => v instanceof cType && (v.propose.id === by || v.target.id === id) && v.guildId.toString() === guildId) != -1 ? true : false;
}

export function GetUserInChallenge(userId: string, guildId: string, cType: any): Challenge {
    return ChallengeManager.instance.challenges.find(v => v instanceof cType && (v.propose.id === userId || v.target.id === userId) && v.guildId.toString() === guildId);
}


