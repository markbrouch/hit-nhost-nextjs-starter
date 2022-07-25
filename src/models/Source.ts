export class Source {
    xref_id: string|undefined;
    formal_name: string|undefined;
    repo_xref_id: string|undefined; // repository
    title: string|undefined;
    author: string|undefined;
    publication: string|undefined;
    note: string|undefined;
    text: string|undefined;
    call_number: string|undefined;

    version: string|undefined;
    corporate: string|undefined;
    page: string|undefined;

    customtags: { [key: string]: string } | undefined;

    public constructor(init?:Partial<Source>) {
        Object.assign(this, init);
    }
}
