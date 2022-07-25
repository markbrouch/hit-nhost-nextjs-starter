import { Source } from "./Source.js";

export class Event {
    xref_id: string|undefined;
    type: string|undefined; // birth, death, marriage, etc.

    sources: Array<Source>|undefined;

    public constructor(init?:Partial<Event>) {
        Object.assign(this, init);
    }
}
