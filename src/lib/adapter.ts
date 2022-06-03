
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
                    fn(item);
                }
                else {
                    console.log(`type ${item.type} not supported.`);
                }

                if(recordsByType[item.type] > 0) {
                    console.log("later recordsByType[item.type] ++");
                    recordsByType[item.type] = recordsByType[item.type] + 1;
                }
                else {
                    console.log("first recordsByType[item.type] = 1");
                    recordsByType[item.type] = 1;
                }

            }
        });
    }

    console.log(recordsByType);
}

const strategy: {[key: string]: any} = {
    'HEAD': (item: Parent) => header(item),
    'INDI': (item: Parent) => individual(item),
    'FAM': (item: Parent) => family(item),
    'REPO': (item: Parent) => repository(item),
    'SOUR': (item: Parent) => source(item),
    'TRLR': (item: Parent) => trailer(item),
}

function header(item: Parent) {
    console.log(`header()`);
}

function individual(item: Parent) {
    console.log(`individual()`);
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
