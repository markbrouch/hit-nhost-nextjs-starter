export class Genealogy {
    name: string|undefined;
    formal_name: string|undefined;
    xref_id: string|undefined;
    _uid: string|undefined;
    change_date: Date|undefined;
    source_uid: string|undefined;

    owner_id: string|undefined;

    public constructor(init?:Partial<Genealogy>) {
        Object.assign(this, init);
    }
}
