import { Family } from '../../models/Family.js';
import { Person } from '../../models/Person.js';
import { Genealogy } from '../../models/Genealogy.js';
import { Kamalii } from '../../models/Kamalii.js';
import { Repository } from '../../models/Repository.js';
import { Source } from '../../models/Source.js';

export async function createGenealogy(genealogy: Genealogy, role: string, jwt_token: string) {
    console.log("mock createGenealogy()");
    return await {};
}

export async function createPerson(person: Person, mookuauhauId: number|undefined, role: string, jwt_token: string) {
    console.log("mock createPerson()");
    return await {};
}

export async function createFamily(fam: Family, mookuauhau_id: number|undefined, role: string, jwt_token: string) {
    console.log("mock createFamily() ", fam.xref_id);
    return await {};
}

export async function createRepository(repo: Repository) {
    console.log("mock createRepository() ", repo.xref_id);
    return await {};
}

export async function createSource(source: Source) {
    console.log("mock createSource() ", source.xref_id);
    return await {};
}

export async function famLinkHusband(fam_id: string, person_id: string, role: string, jwt_token: string) {
    console.log(`mock famLinkHusband() ${fam_id} ${person_id}`);
    return await {};
}

export async function famLinkWife(fam_id: string, person_id: string, role: string, jwt_token: string) {
    console.log(`mock famLinkWife() ${fam_id} ${person_id}`);
    return await {};
}

export async function get_ohana_by_pk(ohana_id: number, role: string, jwt_token: string) {
    console.log(`mock get_ohana_by_pk(${ohana_id}, role, jwt_token)`);
    return await {};
}

export async function get_kanaka_by_pk(kanaka_id: number, role: string, jwt_token: string) {
    console.log(`mock get_kanaka_by_pk(${kanaka_id}, role, jwt_token)`);
    return await {};
}

export async function get_kanaka_by_xrefid(mookuauhau_id: number|undefined, xref_id: string|undefined, role: string, jwt_token: string) : Promise<any|undefined> {
    console.log(`mock get_kanaka_by_xrefid(${mookuauhau_id}, ${xref_id}, role, jwt_token)`);
    return await {};
}

export async function get_ohana_by_xrefid(mookuauhau_id: number|undefined, xref_id: string|undefined, role: string, jwt_token: string) : Promise<any|undefined> {
    console.log(`mock get_ohana_by_xrefid(${mookuauhau_id}, ${xref_id}, role, jwt_token)`);
    return await {};
}

export async function famLinkChild(mookuauhau_id: number|undefined, fam_id: string|undefined, person_id: string, frel: string|undefined, mrel: string|undefined, role: string, jwt_token: string) : Promise<number|undefined> {
    console.log(`mock famLinkChild() ${fam_id} ${person_id}`);
    return;
}

export async function linkPersons(name1: string, rel: string, name2: string) {
}

export async function linkChildParentDirect(parentId: string, childId: string) {
}

export async function get_mookuauhau_queueload_list(role: string, jwt_token: string) : Promise<any|undefined> {
    console.log(`mock get_mookuauhau_queueload_list(role, jwt_token)`);
    return await {};
}

export async function set_mookuauhau_loadstatus(mookuauhau_id: number, load_status: string, role: string, jwt_token: string) : Promise<void|undefined> {
    console.log(`mock set_mookuauhau_loadstatus() ${mookuauhau_id} ${load_status}`);
    return;
}


export async function sleepytime() {
    const sleeptime = 0;

    if(sleeptime) {
        // https://stackoverflow.com/a/38084640/408747
        await setTimeout(
            () => {
                console.log(`waiting ${sleeptime}...`);
            }
            , sleeptime
        );
    }
}

export function appCloseHandler() {

}

export const mutation_fns: { [key: string]: Function } = {
    'creategenealogy': (genealogy: Genealogy, role: string, jwt_token: string) => createGenealogy(genealogy, role, jwt_token),
    'createperson': (person: Person, mookuauhauId: number|undefined, role: string, jwt_token: string) => createPerson(person, mookuauhauId, role, jwt_token),
    'createfamily': (fam: Family, mookuauhauId: number|undefined, role: string, jwt_token: string) => createFamily(fam, mookuauhauId, role, jwt_token),
    'createrepository': (repo: Repository) => createRepository(repo),
    'createsource': (source: Source) => createSource(source),
    // 'linkfamparent': (fam_id: string, person_id: string, ptype: string, role: string, jwt_token: string) => famLinkParent(fam_id, person_id, ptype),
    // 'linkfamhusband': (fam_id: string, person_id: string, ptype: string, role: string, jwt_token: string) => famLinkHusband(fam_id, person_id, role, jwt_token),
    // 'linkfamwife': (fam_id: string, person_id: string, ptype: string, role: string, jwt_token: string) => famLinkWife(fam_id, person_id, role, jwt_token),
    // 'linkfamchild': (mookuauhau_id: number|undefined, fam_id: string, person_id: string, role: string, jwt_token: string) => famLinkChild(mookuauhau_id, fam_id, person_id, role, jwt_token),
    'linkpersons': (name1: string, rel: string, name2: string) => linkPersons(name1, rel, name2),
    'linkchildparentdirect': (parentId: string, childId: string) => linkChildParentDirect(parentId, childId),
    'indexcreation': () => console.log('no op'),
    'close': () => appCloseHandler(),
    'sleepytime': () => sleepytime(),
    'insertmode': () => false,
}
