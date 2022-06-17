export class ChildRel {
    xref_id: string|undefined;
    _frel: string|undefined;
    _mrel: string|undefined;
 
    public constructor(init?:Partial<ChildRel>) {
        Object.assign(this, init);
    }
}
