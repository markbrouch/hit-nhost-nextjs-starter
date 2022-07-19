import { ChildRel } from "./ChildRel.js";

export class Family {
    xref_id: string|undefined;
    formal_name: string|undefined;
    husband: string|undefined;
    wife: string|undefined;
    children: Array<ChildRel>|undefined;
    marriage_date: string|undefined;
    marriage_place: string|undefined;

    _uid: string|undefined;

    public constructor(init?:Partial<Family>) {
        Object.assign(this, init);
    }
}
