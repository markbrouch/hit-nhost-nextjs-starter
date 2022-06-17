export class Person {
    name: string|undefined;
    formal_name: string|undefined;
    xref_id: string|undefined;
    sex: string|undefined;
    _uid: string|undefined;
    name_surname: string|undefined;
    birth_date: Date|undefined;
    birth_place: string|undefined;
    family_spouse: Array<string>|undefined;
    family_child: Array<string>|undefined;

    residence: string|undefined;
    residence_place: string|undefined;
    burial_place: string|undefined;

    change_date: Date|undefined;

    public constructor(init?:Partial<Person>) {
        Object.assign(this, init);
    }
}
