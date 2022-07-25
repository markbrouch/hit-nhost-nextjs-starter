export class Repository {
    xref_id: string|undefined;
    formal_name: string|undefined;
    name: string|undefined;
    address: string|undefined;
    phone: string|undefined;

    public constructor(init?:Partial<Repository>) {
        Object.assign(this, init);
    }
}
