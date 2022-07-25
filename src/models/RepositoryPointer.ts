export class RepositoryPointer {
    pointer: string|undefined;
    formal_name: string|undefined;

    customtags: { [key: string]: string } | undefined;

    public constructor(init?:Partial<RepositoryPointer>) {
        Object.assign(this, init);
    }
}
