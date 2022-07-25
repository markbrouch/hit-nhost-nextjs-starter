export class SourcePointer {
    pointer: string|undefined;
    formal_name: string|undefined;

    page: string|undefined;
    customtags: { [key: string]: string } | undefined;

    public constructor(init?:Partial<SourcePointer>) {
        Object.assign(this, init);
    }
}
