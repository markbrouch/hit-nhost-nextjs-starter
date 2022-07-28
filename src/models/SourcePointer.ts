import { ObjectRecord } from "./ObjectRecord.js";

export class SourcePointer {
    pointer: string|undefined;
    formal_name: string|undefined;

    page: string|undefined;
    note: string|undefined;

    customtags: { [key: string]: string } | undefined;

    objects: Array<ObjectRecord> | undefined;

    public constructor(init?:Partial<SourcePointer>) {
        Object.assign(this, init);
    }
}
