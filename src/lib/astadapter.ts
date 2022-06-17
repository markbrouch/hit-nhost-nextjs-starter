
import { Parent } from "unist";

import { driver as neo4jdriver, auth as neo4jauth, Session, Driver } from 'neo4j-driver';

const NEO4J_ENDPOINT = process.env.NEO4J_ENDPOINT || 'bolt://localhost';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASS || '';

let driver: Driver | undefined = neo4jdriver(NEO4J_ENDPOINT, neo4jauth.basic(NEO4J_USER, NEO4J_PASS));

export async function transform(gedcom: { [key: string]: any }, insertMode: boolean, recordLimit: number) {

    let neo4jsession: Session | undefined;

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

        if (driver && !neo4jsession) {
            // console.log('opening neo4jsession [top]');
            // neo4jsession = driver.session();
        }

        for (let index = 0; index < rootnodes.length; index++) {
            const item = rootnodes[index];
            if (index <= recordLimit) {
                console.log(`[${index}] type: ${item.type}`);
                console.log(`\t formal_name: ${item?.data?.formal_name}`);
                console.log(`\t xref_id: ${item?.data?.xref_id}`);

                if (strategy[item?.type]) {
                    console.log(`type ${item.type} supported.`);

                    const fn = strategy[item.type];
                    const id = await fn(item, neo4jsession, recordsByType);
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

            }
        }
        if (neo4jsession) {
            // console.log('closing neo4jsession [top]');
            // await neo4jsession.close();
        }
    }

    console.log(recordsByType);

    // on application exit:
    if (insertMode) {
        driver?.close();
    }
}

const strategy: { [key: string]: any } = {
    'HEAD': (item: Parent) => header(item),
    'INDI': (item: Parent, neo4jsession: Session, recordsByType: { [key: string]: number }) => individual(item, neo4jsession, recordsByType),
    'FAM': (item: Parent, neo4jsession: Session, recordsByType: { [key: string]: number }) => family(item, neo4jsession, recordsByType),
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

function header(item: Parent) {
    console.log(`header()`);
}

async function individual(item: Parent, neo4jsession: Session, recordsByType: { [key: string]: number }) {
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
    if (person) {
        const rv = await createPerson(driver, neo4jsession, person);

        await sleepytime();
    }

}

async function family(item: Parent, neo4jsession: Session, recordsByType: { [key: string]: number }) {
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

    if (fam) {
        const rv = await createFamily(driver, neo4jsession, fam);
        
        await sleepytime();
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
import { createFamily, createPerson, sleepytime } from "./neo4j-mutations.js";

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

function itemToPerson(item: any) {
    if (item.type !== 'INDI') {
        return;
    }

    const data = item?.data;

    const person = new Person({
        formal_name: data?.formal_name,
        xref_id: data?.xref_id,
        name: data?.NAME,
        sex: data?.SEX,
        family_child: data['@FAMILY_CHILD'],
        family_spouse: data['@FAMILY_SPOUSE'],
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


