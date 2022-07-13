
import { Parent } from "unist";
import { mutation_fns as neo4j_mutation_fns } from "./neo4j-mutations.js";
import { mutation_fns as graphql_mutation_fns } from "./graphql-mutations.js";
 
export async function transform(gedcom: { [key: string]: any }, mutationMode: string, insertMode: boolean, recordLimit: number, inputFilename: string|undefined, mookuauhauId: number|undefined) {
    console.log(`transform()`);

    console.log(`mutationMode: ${mutationMode}`);
    console.log(`mookuauhauId: ${mookuauhauId}`);
    // this allows us to plug in which mutation functions to use
    let mutation_fns: { [key: string]: Function }| undefined;
    if (mutationMode === 'graphql') {
        mutation_fns = graphql_mutation_fns;
    }
    else {
        mutation_fns = neo4j_mutation_fns;
    }

    console.log(`insertMode: ${insertMode}`);
    if (insertMode) {
        // driver = neo4jdriver(NEO4J_ENDPOINT, neo4jauth.basic(NEO4J_USER, NEO4J_PASS));
        // neo4jsession = driver.session()
    }

    
    const gedcomJson = JSON.stringify(gedcom);
    // console.log(gedcomJson);
    const gedcomObject: { [key: string]: any } = JSON.parse(gedcomJson);

    const recordsByType: { [key: string]: number } = {};

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
                const id = await fn(item, recordsByType, insertMode, mutation_fns);
                mookuauhauId = id;
            }
            else {
                // probably queueload
                console.log("probably queueload");
            }
        }

        for (let index = 0; index < rootnodes.length; index++) {
            const item = rootnodes[index];
            if (index <= recordLimit) {
                console.log(`[${index}] type: ${item.type}`);
                console.log(`\t formal_name: ${item?.data?.formal_name}`);
                console.log(`\t xref_id: ${item?.data?.xref_id}`);

                // item.data.mookuauhau_id = mookuauhauId;

                if (strategy[item?.type]) {
                    console.log(`type ${item.type} supported.`);

                    const fn = strategy[item.type];
                    const id = await fn(item, recordsByType, insertMode, mutation_fns, mookuauhauId);
                }
                else {
                    console.log(`type ${item.type} not supported.`);
                }

                if (recordsByType[item.type] > 0) {
                    // console.log("later recordsByType[item.type] ++");
                    recordsByType[item.type] = recordsByType[item.type] + 1;
                }
                else {
                    // console.log("first recordsByType[item.type] = 1");
                    recordsByType[item.type] = 1;
                }

                if(index === 10) {
                    if (insertMode) {
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
    if (insertMode) {
        // await appCloseHandler();
        const fn = mutation_fns['close'];
        await fn();
}
}

const strategy: { [key: string]: any } = {
    'HEAD': (item: Parent, recordsByType: { [key: string]: number }, insertMode: boolean, mutation_fns: { [key: string]: Function }) => header(item, recordsByType, insertMode, mutation_fns),
    'INDI': (item: Parent, recordsByType: { [key: string]: number }, insertMode: boolean, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => individual(item, recordsByType, insertMode, mutation_fns, mookuauhauId),
    'FAM': (item: Parent, recordsByType: { [key: string]: number }, insertMode: boolean, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) => family(item, recordsByType, insertMode, mutation_fns, mookuauhauId),
    'REPO': (item: Parent) => repository(item),
    'SOUR': (item: Parent) => source(item),
    'TRLR': (item: Parent) => trailer(item),
    // subtypes
    'SEX': (item: Parent) => gender(item),
    'NAME': (item: Parent) => name(item),
    'FAMS': (subitem: Parent, item: Parent) => familyspouse(subitem, item),
    'BIRT': (item: Parent) => gender(item),
    'DEAT': (item: Parent) => gender(item),
    'PLAC': (item: Parent) => gender(item),
    'HUSB': (subitem: Parent, item: Parent) => fam_husb(subitem, item),
    'WIFE': (subitem: Parent, item: Parent) => fam_wife(subitem, item),
    'CHIL': (subitem: Parent, item: Parent) => fam_child(subitem, item),
}

// const strategy = strategy_neo4j;
// const strategy = strategy_graphql;

async function header(item: Parent, recordsByType: { [key: string]: number }, insertMode: boolean, mutation_fns: { [key: string]: Function }) {
    console.log(`header()`);

    console.log(`item: `, item);
    
    const genealogy: Genealogy | undefined = itemToGenealogy(item);
    console.log("genealogy: ", genealogy);

    let mookuauhauId: number|undefined;

    if (genealogy && insertMode) {
        // const rv = await createGenealogy(fam);
        const fn = mutation_fns['creategenealogy'];
        const [ role, token ] = ['public', '']; // dummy
        const rv = await fn(genealogy, role, token);
        console.log("rv: ", rv);

        mookuauhauId = rv?.insert_mookuauhau_one.mookuauhau_id;
        console.log("inserted mookuauhau_id: ", mookuauhauId);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createGenealogy()");
    }

    // process.exit(); // TEMP

    return mookuauhauId;
}

async function individual(item: Parent, recordsByType: { [key: string]: number }, insertMode: boolean, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`=======================================================================`);
    console.log(`individual()`);
    console.log(item);

    const person: Person | undefined = itemToPerson(item);
    console.log("person: ", person);

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

            const typeKey = child.type + '.' + child?.data?.formal_name;
            if (recordsByType[typeKey] > 0) {
                // console.log("later recordsByType[typeKey] ++");
                recordsByType[typeKey] = recordsByType[typeKey] + 1;
            }
            else {
                // console.log("first recordsByType[typeKey] = 1");
                recordsByType[typeKey] = 1;
            }

        });
    }

    const DISABLE_PERSON_DEBUG = false; // temp
    if (person && insertMode && !DISABLE_PERSON_DEBUG) {
        // const rv = await createPerson(person);
        const fn = mutation_fns['createperson'];
        const [ role, token ] = ['public', '']; // dummy
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

async function family(item: Parent, recordsByType: { [key: string]: number }, insertMode: boolean, mutation_fns: { [key: string]: Function }, mookuauhauId: number|undefined) {
    console.log(`family()`);
    console.log(item);

    const fam: Family | undefined = itemToFamily(item);
    console.log("fam: ", fam);

    if (item.children) {
        item.children.forEach((child: Node<Data>, index: number) => {
            console.log("child: ", child);
            console.log(`\t type: ${child?.type}`);
            console.log(`\t formal_name: ${child?.data?.formal_name}`);
            console.log(`\t xref_id: ${child?.data?.xref_id}`);

            if (strategy[child?.type]) {
                console.log(`type ${child.type} supported.`);

                const fn = strategy[child.type];
                const id = fn(child, item, recordsByType);
            }
            else {
                console.log(`type ${child.type} not supported.`);
            }

            const typeKey = child.type + '.' + child?.data?.formal_name;
            if (recordsByType[typeKey] > 0) {
                // console.log("later recordsByType[typeKey] ++");
                recordsByType[typeKey] = recordsByType[typeKey] + 1;
            }
            else {
                // console.log("first recordsByType[typeKey] = 1");
                recordsByType[typeKey] = 1;
            }

        });
    }

    if (fam && insertMode) {
        // const rv = await createFamily(fam);
        const fn = mutation_fns['createfamily'];
        const [ role, token ] = ['public', '']; // dummy
        const rv = await fn(fam, mookuauhauId, role, token);

        await mutation_fns['sleepytime']();
    }
    else {
        console.log("skipping createFamily()");
    }

}

function repository(item: Parent) {
    console.log(`repository()`);
}

function source(item: Parent) {
    console.log(`source()`);
}

function trailer(item: Parent) {
    console.log(`trailer()`);
}

// subtypes
function gender(item: Parent) {
    console.log(`gender()`);
}

import { Data, Node } from 'unist';
import { ChildRel } from "../models/ChildRel.js";
import { Family } from "../models/Family.js";
import { Person } from "../models/Person.js";
import { Genealogy } from "../models/Genealogy.js";

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

function itemToPerson(item: any) {
    console.log(`itemToPerson()`);
    if (item.type !== 'INDI') {
        return;
    }

    const data = item?.data;

    console.log("data: ", data);

    const person = new Person({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        name: data?.NAME,
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



