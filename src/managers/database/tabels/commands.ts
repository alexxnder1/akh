export enum ArgumentType {
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER =6,
    CHANNEL =7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11
}

export class Argument {
    public type: ArgumentType;
    public name: string;
    public description: string;
    public required?: boolean | true;

    constructor(type: ArgumentType, name: string, description: string, required?: boolean | true)
    {
        this.type = type;
        this.name = name;
        this.description = description;
        this.required = required;
    }
}

export class Command {
    public name: string;
    public description: string;
    public execute: Function;
    public options : Array<Argument>;

    constructor(name: string, desc: string, func: Function, arg: Array<Argument>) {
        this.name = name;
        this.description = desc;
        this.execute = func;
        this.options = arg;
    }
}
