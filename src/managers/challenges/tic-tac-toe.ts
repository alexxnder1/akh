import { User } from "discord.js";
import { Challenge } from "./main";


export class TicTacToe extends Challenge {
    public turnUser: User;
    public zeroUser: User;
    public xUser: User;
    public tabel: string[][] = [
        ["-2", "-2", "-2"],
        ["-2", "-2", "-2"],
        ["-2", "-2", "-2"]
    ]
}

export type TTTType = "X" | "O";

export function GetWinPattern(tabel: string[][], type: TTTType): boolean {
    var patterns: Array<string[][]> = [
        [
            [type, "-1", "-1"],
            ["-1", type, "-1"],
            ["-1", "-1", type],
        ],
        [
            ["-1", "-1", type],
            ["-1", type, "-1"],
            [type, "-1", "-1"],
        ],
        [
            [type, "-1", "-1"],
            [type, "-1", "-1"],
            [type, "-1", "-1"],
        ],
        [
            ["-1", type, "-1"],
            ["-1", type, "-1"],
            ["-1", type, "-1"],
        ],
        [
            ["-1", "-1", type],
            ["-1", "-1", type],
            ["-1", "-1", type],
        ],
        [
            [type, type, type],
            ["-1", "-1", "-1"],
            ["-1", "-1", "-1"],
        ],
        [
            ["-1", "-1", "-1"],
            [type, type, type],
            ["-1", "-1", "-1"],
        ],
        [
            ["-1", "-1", "-1"],
            ["-1", "-1", "-1"],
            [type, type, type],
        ]
    ] 

    for(let x = 0; x < patterns.length; x++)
    {
        var pattern = patterns.at(x);
        var count = 0;
        for(let i = 0; i < 3; i++) 
            for(let j = 0; j < 3; j++) 
                if(tabel[i][j] === pattern[i][j])
                    count ++; 
    
        if(count === 3)
            return true;
    }

    return false;
}