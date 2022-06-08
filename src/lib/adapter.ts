
import { Parent } from "unist";

export function transform(gedcom: {[key: string]: any}) {

    const recordLimit = 9999999999;

    const gedcomJson = JSON.stringify(gedcom);
    // console.log(gedcomJson);
    const gedcomObject: {[key: string]: any} = JSON.parse(gedcomJson);

    const recordsByType: {[key: string]: number} = {};

    if(gedcomObject.type === 'root') {
        const rootnodes: Array<any> = gedcomObject?.children;

        rootnodes.forEach((item, index) => {

            if(index <= recordLimit) {
                console.log(`[${index}] type: ${item.type}`);
                console.log(`\t formal_name: ${item?.data?.formal_name}`);
                console.log(`\t xref_id: ${item?.data?.xref_id}`);

                if( strategy[item?.type] ) {
                    console.log(`type ${item.type} supported.`);

                    const fn = strategy[item.type];
                    const id = fn(item, recordsByType);
                }
                else {
                    console.log(`type ${item.type} not supported.`);
                }

                if(recordsByType[item.type] > 0) {
                    // console.log("later recordsByType[item.type] ++");
                    recordsByType[item.type] = recordsByType[item.type] + 1;
                }
                else {
                    // console.log("first recordsByType[item.type] = 1");
                    recordsByType[item.type] = 1;
                }

            }
        });
    }

    console.log(recordsByType);
}

const strategy: {[key: string]: any} = {
    'HEAD': (item: Parent) => header(item),
    'INDI': (item: Parent, recordsByType: {[key: string]: number}) => individual(item, recordsByType),
    'FAM': (item: Parent) => family(item),
    'REPO': (item: Parent) => repository(item),
    'SOUR': (item: Parent) => source(item),
    'TRLR': (item: Parent) => trailer(item),
    // subtypes
    'SEX': (item: Parent) => gender(item),
    'NAME': (item: Parent) => name(item),
    'FAMS': (item: Parent) => familyspouse(item),
    'BIRT': (item: Parent) => gender(item),
    'DEAT': (item: Parent) => gender(item),
    'PLAC': (item: Parent) => gender(item),
}

function header(item: Parent) {
    console.log(`header()`);
}

function individual(item: Parent, recordsByType: {[key: string]: number}) {
    console.log(`individual()`);


    console.log(item);

    if(item.children) {
        item.children.forEach((child: Node<Data>, index: number) => {
            console.log("child: ", child);
            console.log(`\t formal_name: ${child?.data?.formal_name}`);
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
            if(recordsByType[typeKey] > 0) {
                // console.log("later recordsByType[typeKey] ++");
                recordsByType[typeKey] = recordsByType[typeKey] + 1;
            }
            else {
                // console.log("first recordsByType[typeKey] = 1");
                recordsByType[typeKey] = 1;
            }

        });
    }
}

function family(item: Parent) {
    console.log(`family()`);
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
function familyspouse(item: Parent) {
    console.log(`familyspouse()`);
}
