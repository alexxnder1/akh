export enum Events {
    GuildManagerValidate = 0
}

export interface Event {
    type: Events;
    function: Function;
}

export class EventManager {
    static #instance: EventManager = null;

    public listeners: Array<Event> = [];

    public static get instance(): EventManager {
        if(!this.#instance)
        {
            this.#instance = new EventManager();
        }
        return this.#instance;
    }

    public RegisterEmitter(eventType: Events) {
        this.listeners.forEach((e) => {
            if(e.type === eventType) {
                e.function();
            }
        })
    }

    public AddListener(eventType: Events, f: Function) {
        this.listeners.push({ type:eventType, function: f });
    }
}
