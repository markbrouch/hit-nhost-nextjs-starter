export class ObjectRecord {
    xref_id: string|undefined;
    file: string|undefined;
    format: string|undefined;
    title: string|undefined;

    customtags: { [key: string]: string } | undefined;

    public constructor(init?:Partial<ObjectRecord>) {
        Object.assign(this, init);
    }
}
