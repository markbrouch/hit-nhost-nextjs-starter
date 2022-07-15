export class Kamalii {
    kamalii_id: number|undefined;
    kanaka_id: number|undefined;
    ohana_id: number|undefined;
    _frel: string|undefined; // Natural|Step|Unknown|undefined
    _mrel: string|undefined; // Natural|Step|Unknown|undefined
 
    public constructor(init?:Partial<Kamalii>) {
        Object.assign(this, init);
    }
}
