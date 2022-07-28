import { ObjectRecord } from "./ObjectRecord.js";
import { Source } from "./Source.js";

// type / date / plac / sources[] | objects[]

export class EventRecord {
    xref_id: string|undefined;
    type: string|undefined;
    place: string|undefined;
    date: string|undefined;

    sources: Array<Source>|undefined;
    objects: Array<ObjectRecord>|undefined;

    public constructor(init?:Partial<EventRecord>) {
        Object.assign(this, init);
    }
}
