export const DELETE_ACCOUNT_AFTER_LEFT_MS = 5*86400*1000;

export class UserDb {
    public coins: number;
    public totalCoinflips: number;
    public coinflipWins: number;
    public coinflipLoss: number;
    public discordId: string; 
    public avatar: string;
    public name: string;  
     
    // when user leaves guild this thing has a value
    public deleteTimestamp: string | 'null';
}
