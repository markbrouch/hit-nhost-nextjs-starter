export class Obje {
    xref_id: string|undefined;
    file: string|undefined;
    format: string|undefined;
    title: string|undefined;

    customtags: { [key: string]: string } | undefined;

    public constructor(init?:Partial<Obje>) {
        Object.assign(this, init);
    }
}
