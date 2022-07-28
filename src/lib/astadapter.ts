
import { Parent } from "unist";
import { mutation_fns as neo4j_mutation_fns } from "./mutations/neo4j-mutations.js";
import { mutation_fns as graphql_mutation_fns } from "./mutations/graphql-mutations.js";
import { mutation_fns as mock_mutation_fns } from "./mutations/mock-mutations.js";
 
import { Data, Node } from 'unist';
import { ChildRel } from "../models/ChildRel.js";
import { Family } from "../models/Family.js";
import { Person } from "../models/Person.js";
import { Genealogy } from "../models/Genealogy.js";
import { recordsByType } from "./utils.js";
import { SourcePointer } from "../models/SourcePointer.js";
import { Repository } from "../models/Repository.js";
import { Source } from "../models/Source.js";
import { RepositoryPointer } from "../models/RepositoryPointer.js";
import { EventRecord } from "../models/EventRecord.js";

export async function transform(gedcom: { [key: string]: any }, mutationMode: string, recordLimit: number, inputFilename: string|undefined, mookuauhauId: number|undefined) {
    console.log(`transform()`);

    console.log(`mutationMode: ${mutationMode}`);
    console.log(`mookuauhauId: ${mookuauhauId}`);

    // this allows us to plug in which mutation functions to use
    let mutation_fns: { [key: string]: Function }| undefined;
    if (mutationMode === 'graphql') {
        mutation_fns = graphql_mutation_fns;
    }
    else if (mutationMode === 'neo4j') {
        mutation_fns = neo4j_mutation_fns;
    }
    else if (mutationMode === 'mock') {
        mutation_fns = mock_mutation_fns;
    }
    else {
        mutation_fns = mock_mutation_fns;
    }

    const gedcomJson = JSON.stringify(gedcom);
    // console.log(gedcomJson);
    const gedcomObject: { [key: string]: any } = JSON.parse(gedcomJson);

    if (gedcomObject.type === 'root') {
        const rootnodes: Array<any> = gedcomObject?.children;

        // hardcode HEAD insert, it is not there
        if (strategy['HEAD']) {
            if(!mookuauhauId) {
                const fn = strategy['HEAD'];
                const getFilename = (filepath: string|undefined) => {
                    if(!filepath) {
                        return '';
                    }
                    return filepath.substring(filepath.lastIndexOf('/')+1);
                };
                const filename = getFilename(inputFilename);
                console.log("filename: ", filename);
                const item = {
                    data: {
                        owner_id: null,
                        name: filename?.replace('.ged', ''),
                        source_uid: filename,
                    }
                };
                const id = await fn(item, mutation_fns);
                mookuauhauId = id;
            }
            else {
                // probably queueload
                console.log("doing queueload");
            }
        }

        // iterate entire loaded file records
        for (let index = 0; index < rootnodes.length; index++) {
            const item = rootnodes[index];
            if (index <= recordLimit) {
                console.log(`[${index}] type: ${item.type}`);
                console.log(`\t formal_name: ${item?.data?.formal_name}`);
                console.log(`\t xref_id: ${item?.data?.xref_id}`);

                // item.data.mookuauhau_id = mookuauhauId;

                await processOneGedcomRecord(item, mookuauhauId, mutation_fns);

                if(index === 10) {
                    if (mutation_fns['indexcreation']) {
                        // only for neo4j
                        // await indexCreation();
                        const fn = mutation_fns['indexcreation'];
                        await fn();
                    }
                }

            }
        }
    }

    console.log(recordsByType);

    // on application exit:
    if (mutation_fns['close']) {
        // await appCloseHandler();
        const fn = mutation_fns['close'];
        await fn();
    }
}

async function processOneGedcomRecord(item: any, mookuauhauId: number|undefined, mutation_fns: { [key: string]: Function }) {
    console.log("processOneGedcomRecord()");

    if (strategy[item?.type]) {
        console.log(`type ${item.type} supported.`);

        if(item.type === 'HEAD' && mookuauhauId && mookuauhauId > 0) {
            console.log(`skip creating HEAD , already exists`);
        }
        else {
            // get the function to process this type based on the mutation mode setting
            const fn = strategy[item.type];
            const id = await fn(item, mutation_fns, mookuauhauId);
        }
    }
    else {
        console.log(`type ${item.type} not supported.`);
    }

    incrementRecordsByType(item.type);
}

const strategy: { [key: string]: any } = {
    'HEAD': (item: Parent, mutation_fns: { [key: string]: Function }) => header(item, mutation_fns),
    'INDI': (item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => individual(item, mutation_fns, mookuauhauId),
    'FAM': (item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => family(item, mutation_fns, mookuauhauId),
    'REPO': (item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => repository(item, mutation_fns, mookuauhauId),
    'SOUR': (item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => source(item, mutation_fns, mookuauhauId),
    'TRLR': (item: Parent) => trailer(item),
}

const strategy_subtypes: { [key: string]: any } = {
    // subtypes
    // 'SEX': (item: Parent) => gender(item),
    // 'NAME': (item: Parent) => name(item),
    // 'FAMS': (subitem: Parent, item: Parent) => familyspouse(subitem, item),
    // 'BIRT': (item: Parent) => gender(item),
    // 'DEAT': (item: Parent) => gender(item),
    // 'PLAC': (item: Parent) => gender(item),
    'HUSB': (subitem: Parent, item: Parent) => fam_husb(subitem, item),
    'WIFE': (subitem: Parent, item: Parent) => fam_wife(subitem, item),
    'CHIL': (subitem: Parent, item: Parent) => fam_child(subitem, item),
    'SOUR': (subitem: Parent, item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => sourcePointer(subitem, item, mutation_fns, mookuauhauId),
    'REPO': (subitem: Parent, item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => repositoryPointer(subitem, item, mutation_fns, mookuauhauId),
    'EVEN': (subitem: Parent, item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => eventRecord(subitem, item, mutation_fns, mookuauhauId),
}

async function header(item: Parent, mutation_fns: { [key: string]: Function }) {
    console.log(`header()`);

    console.log(`item: `, item);
    
    const insertMode: boolean = mutation_fns['insertmode']();

    const genealogy: Genealogy | undefined = itemToGenealogy(item);
    console.log("genealogy: ", genealogy);

    let mookuauhauId: number|undefined;

    if (genealogy && insertMode) {
        // const rv = await createGenealogy(fam);
        const fn = mutation_fns['creategenealogy'];
        const [ role, token ] = ['admin', '']; // hardcoded
        const rv = await fn(genealogy, role, token);
        console.log("rv: ", rv);

        if(rv?.insert_mookuauhau_one?.mookuauhau_id) {
            mookuauhauId = rv?.insert_mookuauhau_one?.mookuauhau_id;
            console.log("inserted mookuauhau_id: ", mookuauhauId);
        }

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createGenealogy()");
    }

    // process.exit(); // TEMP

    return mookuauhauId;
}

export async function individual(item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`=======================================================================`);
    console.log(`individual()`);
    console.log(item);

    const insertMode: boolean = mutation_fns['insertmode']();

    // const person: Person | undefined = itemToPerson(item);
    const person: Person | undefined = itemToPersonAst(item);
    console.log("person: ", person);

    // child records here are additional data 
    if (item.children) {
        item.children.forEach((child: Node<Data>, index: number) => {
            console.log("child: ", child);
            console.log(`\t formal_name: ${child?.data?.formal_name}`);
            console.log(`\t type: ${child?.type}`);
            console.log(`\t xref_id: ${child?.data?.xref_id}`);
            // const id = strategy[item.type](item);

            // if(child.children) {
            //     child.children.forEach((subchild, index: number) => {
            //         console.log(subchild);
            //         console.log(`\t formal_name: ${subchild?.data?.formal_name}`);
            //         console.log(`\t xref_id: ${subchild?.data?.xref_id}`);
            //     });
            // }

            // BIRT|NAME|SEX|FAMC|FAMS
            const typeKey = child.type + '.' + child?.data?.formal_name;
            incrementRecordsByType(typeKey);
        });
    }

    const DISABLE_PERSON_DEBUG = false; // temp
    if (person && insertMode && !DISABLE_PERSON_DEBUG) {
        // const rv = await createPerson(person);
        const fn = mutation_fns['createperson'];
        const [ role, token ] = ['admin', '']; // hardcoded
        console.log("mookuauhauId ", mookuauhauId);
        const rv = await fn(person, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createPerson()");
        // console.log("insertMode: ", insertMode);
        // console.log("person: ", person);
        // process.exit();
    }

}

async function family(item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`family()`);
    console.log(item);

    const insertMode: boolean = mutation_fns['insertmode']();
    // console.log("typeof mutation_fns['insertmode']: ", typeof mutation_fns['insertmode']);

    // const fam: Family | undefined = itemToFamily(item);
    const fam: Family | undefined = itemToFamilyAst(item);
    console.log("fam: ", fam);

    if (item.children) {
        item.children.forEach((child: Node<Data>, index: number) => {
            console.log("child: ", child);
            console.log(`\t type: ${child?.type}`);
            console.log(`\t formal_name: ${child?.data?.formal_name}`);
            console.log(`\t xref_id: ${child?.data?.xref_id}`);

            if (strategy_subtypes[child?.type]) {
                console.log(`type ${child.type} supported.`);

                const fn = strategy_subtypes[child.type];
                const id = fn(child, item, mutation_fns, mookuauhauId);
            }
            else {
                console.log(`type ${child.type} not supported.`);
            }

            const typeKey = child.type + '.' + child?.data?.formal_name;
            incrementRecordsByType(typeKey);
        });
    }

    if (fam && insertMode) {
        // const rv = await createFamily(fam);
        const fn = mutation_fns['createfamily'];
        const [ role, token ] = ['admin', '']; // hardcoded
        const rv = await fn(fam, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createFamily()");
    }

}

async function repository(item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`repository()`);
    console.log(item);

    // console.log("typeof mutation_fns['insertmode']: ", typeof mutation_fns['insertmode']);
    const insertMode: boolean = mutation_fns['insertmode']();

    const repo: Repository | undefined = itemToRepositoryAst(item);
    console.log("repo: ", repo);

    if (item.children) {
        item.children.forEach((child: Node<Data>, index: number) => {
            console.log("child: ", child);
            console.log(`\t type: ${child?.type}`);
            console.log(`\t formal_name: ${child?.data?.formal_name}`);
            console.log(`\t xref_id: ${child?.data?.xref_id}`);

            if (strategy_subtypes[child?.type]) {
                console.log(`type ${child.type} supported.`);

                const fn = strategy_subtypes[child.type];
                const id = fn(child, item, mutation_fns, mookuauhauId);
            }
            else {
                console.log(`type ${child.type} not supported.`);
            }

            const typeKey = child.type + '.' + child?.data?.formal_name;
            incrementRecordsByType(typeKey);

        });
    }

    if (repo && insertMode) {
        // const rv = await createFamily(repo);
        const fn = mutation_fns['createrepository'];
        const [ role, token ] = ['admin', '']; // hardcoded
        const rv = await fn(repo, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createRepository()");
    }

}

async function source(item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`source()`);
    // note: SOUR could be called as a main record, or a child pointer record
    console.log(item);

    const pointer = item?.data?.pointer;
    if(pointer) { console.log(`pointer: ${pointer}`);}

    // console.log("typeof mutation_fns['insertmode']: ", typeof mutation_fns['insertmode']);

    const insertMode: boolean = mutation_fns['insertmode']();

    const source: Source | undefined = itemToSourceAst(item);
    console.log("source: ", source);

    if (item.children) {
        item.children.forEach((child: Node<Data>, index: number) => {
            console.log("child: ", child);
            console.log(`\t type: ${child?.type}`);
            console.log(`\t formal_name: ${child?.data?.formal_name}`);
            console.log(`\t xref_id: ${child?.data?.xref_id}`);

            if (strategy_subtypes[child?.type]) {
                console.log(`type ${child.type} supported.`);

                const fn = strategy_subtypes[child.type];
                const id = fn(child, item, mutation_fns, mookuauhauId);
            }
            else {
                console.log(`type ${child.type} not supported.`);
            }

            const typeKey = child.type + '.' + child?.data?.formal_name;
            incrementRecordsByType(typeKey);

        });
    }

    if (source && insertMode) {
        // const rv = await createFamily(source);
        const fn = mutation_fns['createsource'];
        const [ role, token ] = ['admin', '']; // hardcoded
        const rv = await fn(source, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createSource()");
    }
}

async function sourcePointer(subitem: Parent, item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`sourcePointer()`);
    // note: SOUR could be called as a main record, or a child pointer record
    console.log(subitem);

    const pointer = subitem?.data?.pointer;
    if(pointer) { console.log(`pointer: ${pointer}`);}

    // console.log("typeof mutation_fns['insertmode']: ", typeof mutation_fns['insertmode']);

    const insertMode: boolean = mutation_fns['insertmode']();

    const sp: SourcePointer | undefined = itemToSourcePointerAst(subitem);
    console.log("sp: ", sp);

    if (sp && insertMode) {
        // const rv = await createFamily(source);
        const fn = mutation_fns['createsourcepointer'];
        const [ role, token ] = ['admin', '']; // hardcoded
        const rv = await fn(sp, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createSourcePointer()");
    }
}

async function repositoryPointer(subitem: Parent, item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`repositoryPointer()`);
    // note: REPO could be called as a main record, or a child pointer record
    console.log(subitem);

    const pointer = subitem?.data?.pointer;
    if(pointer) { console.log(`pointer: ${pointer}`);}

    // console.log("typeof mutation_fns['insertmode']: ", typeof mutation_fns['insertmode']);

    const insertMode: boolean = mutation_fns['insertmode']();

    const rp: RepositoryPointer | undefined = itemToRepositoryPointerAst(subitem);
    console.log("rp: ", rp);

    if (rp && insertMode) {
        const fn = mutation_fns['createrepositorypointer'];
        const [ role, token ] = ['admin', '']; // hardcoded
        const rv = await fn(rp, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createRepositoryPointer()");
    }
}

async function eventRecord(subitem: Parent, item: Parent, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`eventRecord()`);
    console.log(subitem);

    // type / date / plac / sources[] | objects[]

    // console.log("typeof mutation_fns['insertmode']: ", typeof mutation_fns['insertmode']);

    const insertMode: boolean = mutation_fns['insertmode']();

    const ev: EventRecord | undefined = itemToEventRecordAst(subitem);
    console.log("ev: ", ev);

    if (ev && insertMode) {
        const fn = mutation_fns['createevent'];
        const [ role, token ] = ['admin', '']; // hardcoded
        const rv = await fn(ev, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createEventRecord()");
    }
}

function incrementRecordsByType(typeKey: string) {
    if (recordsByType[typeKey] > 0) {
        // console.log("later recordsByType[item.type] ++");
        recordsByType[typeKey] = recordsByType[typeKey] + 1;
    }
    else {
        // console.log("first recordsByType[item.type] = 1");
        recordsByType[typeKey] = 1;
    }
}

function trailer(item: Parent) {
    console.log(`trailer()`);
}

// subtypes
function gender(item: Parent) {
    console.log(`gender()`);
}

function name(item: Parent<Node<Data>, Data>) {
    console.log(`name()`);
    console.log("item: ", item);
}

function birth(item: Parent) {
    console.log(`birth()`);
}

function death(item: Parent) {
    console.log(`death()`);
}
function place(item: Parent) {
    console.log(`place()`);
}
function familyspouse(subitem: Parent, item: Parent) {
    console.log(`familyspouse()`);
    console.log(subitem);
    // printChildren(subitem);
}

function fam_husb(subitem: Parent, item: Parent) {
    console.log(`fam_husb()`);
    console.log("subitem: ", subitem);
    console.log("item xref_id: ", item?.data?.xref_id);
}

function fam_wife(subitem: Parent, item: Parent) {
    console.log(`fam_wife()`);
    console.log("subitem: ", subitem);
    console.log("item xref_id: ", item?.data?.xref_id);
}

function fam_child(subitem: Parent, item: Parent) {
    console.log(`fam_child()`);
    console.log("subitem: ", subitem);
    console.log("item xref_id: ", item?.data?.xref_id);
}


function printChildren(item: Parent) {
    if (item.children) {
        item.children.forEach((child: Node<Data>, index: number) => {
            console.log("child: ", child);
            console.log(`\t formal_name: ${child?.data?.formal_name}`);
            console.log(`\t pointer: ${child?.data?.pointer}`);
            console.log(`\t type: ${child?.type}`);
            console.log(`\t xref_id: ${child?.data?.xref_id}`);
            // const id = strategy[item.type](item);

            // if(child.children) {
            //     child.children.forEach((subchild, index: number) => {
            //         console.log(subchild);
            //         console.log(`\t formal_name: ${subchild?.data?.formal_name}`);
            //         console.log(`\t xref_id: ${subchild?.data?.xref_id}`);
            //     });
            // }


        });
    }
}

function itemToGenealogy(item: any) {
    // , filename: string|undefined, genealogyName: string|undefined
    console.log(`itemToGenealogy()`);
    // if (item.type !== 'HEAD') {
    //     return;
    // }

    const data = item?.data;

    console.log("data: ", data);

    const genealogy = new Genealogy({
        name: data?.name,
        xref_id: data?.xref_id,

        // change_date: data['CHANGE/DATE'],

        source_uid: data?.source_uid,
    });

    return genealogy;
}

export function itemToPerson(item: any) {
    console.log(`itemToPerson() [compact]`);
    if (item.type !== 'INDI') {
        return;
    }

    console.log("item: ", item);

    const data = item?.data;

    console.log("data: ", data);

    console.log("item.children ", item.children);

    const personNameElement = item?.children?.find((el:any) => el.type === 'NAME');
    console.log("personNameElement ", personNameElement);

    const personName = item?.children?.find((el:any) => el.type === 'NAME')?.value || data?.NAME;
    console.log("item?.children?.find((el:any) => el.type === 'NAME')?.value", item?.children?.find((el:any) => el.type == 'NAME')?.value);

    const person = new Person({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        name: personName,
        sex: data?.SEX,
        family_child: data['@FAMILY_CHILD'],
        family_spouse: data['@FAMILY_SPOUSE'],

        change_date: data['CHANGE/DATE'],

        name_surname: data['NAME/SURNAME'],
        name_aka: data['NAME/_AKA'],
        birth_date: data['BIRTH/DATE'],
        birth_place: data['BIRTH/PLACE'],
        source_uid: data['_UID'],

        burial_place: data['BURIAL/PLACE'], // ???

    });

    if (data['@FAMILY_CHILD']) {
        person.family_child = [];
        person.family_child?.push(data['@FAMILY_CHILD']);
    }

    if (data['@FAMILY_SPOUSE']) {
        person.family_spouse = [];
        person.family_spouse?.push(data['@FAMILY_SPOUSE']);
    }
    if (data['+@FAMILY_SPOUSE']) {
        const childs: Array<string> = data['+@FAMILY_SPOUSE'];
        childs.forEach((val, index) => {
            person.family_spouse?.push(val);
        });
    }

    // missing required fields
    if (!person.name) {
        person.name = person.xref_id;
    }

    return person;
}

function itemToFamily(item: any) {
    console.log(`itemToFamily() [compact]`);
    if (item.type !== 'FAM') {
        return;
    }

    const data = item?.data;

    const fam = new Family({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        husband: data['@HUSBAND'],
        wife: data['@WIFE'],
        marriage_date: data['MARRIAGE/DATE'],
        marriage_place: data['MARRIAGE/PLACE'],
    });

    if (data['@CHILD']) {
        fam.children = [];
        fam.children?.push(new ChildRel({
            xref_id: data['@CHILD'],
            _frel: data['CHILD/_FREL'],
            _mrel: data['CHILD/_MREL'],
        }));
    }
    if (data['+@CHILD']) {
        const childs: Array<string> = data['+@CHILD'];
        const childs_frel: Array<string> = data['+CHILD/_FREL'];
        const childs_mrel: Array<string> = data['+CHILD/_MREL'];
        childs.forEach((val, index) => {
            const frel = childs_frel ? childs_frel[index] : undefined;
            const mrel = childs_mrel ? childs_mrel[index] : undefined;

            fam.children?.push(new ChildRel({
                xref_id: val,
                _frel: frel,
                _mrel: mrel,
            }));
        });
    }

    return fam;
}

function getChildByTypeName(item: any, type: string) {
    return item?.children?.find((el:any) => el.type === type);
}

export function itemToPersonAst(item: any) {
    console.log(`itemToPersonAst() [ast]`);
    if (item.type !== 'INDI') {
        return;
    }

    console.log("item: ", item);

    const data = item?.data;

    console.log("data: ", data);

    console.log("item.children ", item.children);

    const personChld = getChildByTypeName(item, 'NAME');
    console.log("personChld: ", personChld);
    const personName = personChld?.value;
    console.log("personName: ", personName);

    const birt = getChildByTypeName(item, 'BIRT');
    const deat = getChildByTypeName(item, 'DEAT');
    const bury = getChildByTypeName(item, 'BURI');

    const person = new Person({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        name: personName,
        sex: getChildByTypeName(item, 'SEX')?.value,
        family_child: data['@FAMILY_CHILD'],
        family_spouse: data['@FAMILY_SPOUSE'],

        change_date: getChildByTypeName(item, 'CHAN')?.value,

        name_surname: personChld?.children?.find((el:any) => el.type === 'SURN')?.value,
        name_aka: personChld?.children?.find((el:any) => el.type === '_AKA')?.value,
        birth_date: birt?.children?.find((el:any) => el.type === 'DATE')?.value,
        birth_place: birt?.children?.find((el:any) => el.type === 'PLAC')?.value,
        death_date: deat?.children?.find((el:any) => el.type === 'DATE')?.value,
        death_place: deat?.children?.find((el:any) => el.type === 'PLAC')?.value,
        source_uid: data['_UID'],

        burial_place: bury?.children?.find((el:any) => el.type === 'PLAC')?.value,

        // note: getChildByTypeName(item, 'NOTE')?.value,

    });

    // const famc: Array<any> = item?.children?.filter((x:any) => x.type === 'FAMC');
    // if (famc) {
    //     person.family_child = [];
    //     famc.forEach(() => {
    //         person.family_child?.push();
    //     });
    // }

    // const fams: Array<any> = item?.children?.filter((x:any) => x.type === 'FAMS');
    // if (fams) {
    //     person.family_spouse = [];
    //     fams.forEach(() => {
    //         person.family_spouse?.push();
    //     });
    // }

    // SOUR
    const sourcePointers: Array<any> = item?.children?.filter((x:any) => x.type === 'SOUR');
    if (sourcePointers) {
        person.sourcePointers = [];
        sourcePointers.forEach((sp) => {
            person.sourcePointers?.push(new SourcePointer({
                page: getChildByTypeName(sp, 'PAGE'),
                pointer: sp?.data?.pointer,
                formal_name: sp?.data?.formal_name,
            }));
            // custom_tag ? TODO
        });
    }

    // missing required fields
    if (!person.name) {
        person.name = person.xref_id;
    }

    return person;
}

function itemToFamilyAst(item: any) {
    console.log(`itemToFamilyAst() [ast]`);
    if (item.type !== 'FAM') {
        return;
    }

    const data = item?.data;

    const marr = getChildByTypeName(item, 'MARR');

    const fam = new Family({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        _uid: getChildByTypeName(item, '_UID')?.value,
        husband: getChildByTypeName(item, 'HUSB')?.data?.pointer,
        wife: getChildByTypeName(item, 'WIFE')?.data?.pointer,
        marriage_date: getChildByTypeName(marr, 'DATE')?.data?.value,
        marriage_place: getChildByTypeName(marr, 'PLAC')?.data?.value,
    });

    const chils: Array<any> = item?.children?.filter((x:any) => x.type === 'CHIL');
    console.log(`chils.length = ${chils.length}`);
    if (chils) {
        fam.children = [];
        chils.forEach((val, index) => {
            fam.children?.push(new ChildRel({
                xref_id: val?.data?.pointer,
                _frel: getChildByTypeName(val, '_FREL')?.value,
                _mrel: getChildByTypeName(val, '_MREL')?.value,
            }));
        });
    }

    return fam;
}

function itemToRepositoryAst(item: any) {
    console.log(`itemToRepositoryAst() [ast]`);
    if (item.type !== 'REPO') {
        return;
    }

    const data = item?.data;

    const repo = new Repository({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        name: getChildByTypeName(item, 'NAME')?.value,
        address: getChildByTypeName(item, 'ADDR')?.value,
        phone: getChildByTypeName(item, 'PHON')?.value,
    });

    return repo;
}

function itemToSourceAst(item: any) {
    console.log(`itemToSourceAst() [ast]`);
    if (item.type !== 'SOUR') {
        return;
    }

    const data = item?.data;

    const source = new Source({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        title: getChildByTypeName(item, 'TITL')?.value,
        author: getChildByTypeName(item, 'AUTH')?.value,
        publication: getChildByTypeName(item, 'PUBL')?.value,
        note: getChildByTypeName(item, 'NOTE')?.value,
        text: getChildByTypeName(item, 'TEXT')?.value,
        call_number: getChildByTypeName(item, 'CALN')?.value,
    
        version: getChildByTypeName(item, 'VERS')?.value,
        corporate: getChildByTypeName(item, 'CORP')?.value,
        page: getChildByTypeName(item, 'PAGE')?.value,
    
        // custom_tag
        customtags: {},
    });

    const checkTags = ['_ITALIC', '_PAREN', '_AKA', '_SCBK', '_PRIM', '_TYPE', '_SSHOW'];
    checkTags.forEach(ct => {
        if(source.customtags && getChildByTypeName(item, ct)?.value) {
            source.customtags[ct] = getChildByTypeName(item, ct)?.value;
        }
    });

    return source;
}

function itemToSourcePointerAst(item: any) {
    console.log(`itemToSourcePointerAst() [ast]`);
    if (item.type !== 'SOUR') {
        return;
    }

    const data = item?.data;

    const sp = new SourcePointer({
        formal_name: data?.formal_name,
        pointer: data?.pointer,
    });

    return sp;
}

function itemToRepositoryPointerAst(item: any) {
    console.log(`itemToRepositoryPointerAst() [ast]`);
    if (item.type !== 'REPO') {
        return;
    }

    const data = item?.data;

    const rp = new RepositoryPointer({
        formal_name: data?.formal_name,
        pointer: data?.pointer,
    });

    return rp;
}

function itemToEventRecordAst(item: any) {
    console.log(`itemToEventRecordAst() [ast]`);
    if (item.type !== 'EVEN') {
        return;
    }

    const data = item?.data;

    const ev = new EventRecord({
        type: data?.type,
        date: getChildByTypeName(item, 'DATE')?.value,
        place: getChildByTypeName(item, 'PLAC')?.value,
    });

    const sources: Array<any> = item?.children?.filter((x:any) => x.type === 'SOUR');
    console.log(`sources.length = ${sources.length}`);
    if (sources) {
        item.sources = [];
        sources.forEach((val, index) => {
            item.sources?.push(new SourcePointer({
                formal_name: val?.data?.formal_name,
                page: getChildByTypeName(val, 'PAGE'),
                note: getChildByTypeName(val, 'NOTE'),
                // object: getChildByTypeName(val, 'OBJE'),
                // pointer: val?.data?.pointer,
            }));
        });
    }

    return ev;
}

