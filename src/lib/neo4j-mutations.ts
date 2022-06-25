import { driver as neo4jdriver, auth as neo4jauth, Session, Driver, Node as Neo4jnode } from 'neo4j-driver';

const NEO4J_ENDPOINT = process.env.NEO4J_ENDPOINT || 'bolt://localhost';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASS || '';

let driver: Driver | undefined = neo4jdriver(NEO4J_ENDPOINT, neo4jauth.basic(NEO4J_USER, NEO4J_PASS));

import { Family } from '../models/Family.js';
import { Person } from '../models/Person.js';

export async function createPerson(person: Person): Promise<Neo4jnode | undefined> {
    console.log("createPerson()");

    let neo4jsession: Session | undefined;
    let node: Neo4jnode | undefined = undefined;

    try {

        if (driver) {
            console.log('opening neo4jsession [indi]');
            neo4jsession = driver.session();
        }

        let params: { [key: string]: any } = {
            name: person.name,
            xref_id: person.xref_id,
        };

        if (person.formal_name) { params.formal_name = person.formal_name; }
        if (person.birth_date) { params.birth_date = person.birth_date; }
        if (person.birth_place) { params.birth_place = person.birth_place; }
        if (person.burial_place) { params.burial_place = person.burial_place; }
        if (person.change_date) { params.change_date = person.change_date; }
        if (person.name_surname) { params.name_surname = person.name_surname; }
        if (person.residence) { params.residence = person.residence; }
        if (person.residence_place) { params.residence_place = person.residence_place; }

        // family_child: person.family_child,
        // family_spouse: person.family_spouse,

        const result = await neo4jsession?.run(
            'CREATE (a:Person {' + Object.keys(params).map((x) => `${x}: $${x}`).join(', ') + '}) RETURN a',
            params
        );

        const singleRecord = result?.records[0];
        let node = singleRecord?.get(0);

        console.log(node.properties.name);

    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [individual]');
            neo4jsession.close();
        }
    }

    return node;
}

export async function createFamily(fam: Family): Promise<Neo4jnode | undefined> {
    console.log("createFamily()");
    let neo4jsession: Session | undefined;
    let node: Neo4jnode | undefined = undefined;

    try {

        if (!driver) {
            console.log('no neo4j driver!!!!');
            return node;
        }
        if (driver) {
            console.log('opening neo4jsession [family]');
            neo4jsession = driver.session();
        }

        let params: { [key: string]: any } = {
            xref_id: fam.xref_id,
            formal_name: fam.formal_name,
        };
        if (fam.formal_name) { params.formal_name = fam.formal_name; }
        if (fam.wife) { params.wife = fam.wife; }
        if (fam.husband) { params.husband = fam.husband; }

        const result = await neo4jsession?.run(
            'CREATE (a:Family {' + Object.keys(params).map((x) => `${x}: $${x}`).join(', ') + '}) RETURN a',
            params
        );

        const singleRecord = result?.records[0];
        node = singleRecord?.get(0);

        console.log(node?.properties.name);

    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [family]');
            await neo4jsession.close();
        }
    }

    // relations / edges

    if (fam.xref_id && fam.husband) {
        famLinkParent(fam.xref_id, fam.husband, 'k');
    }
    else {
        console.log(`no famLinkParent husband for ${fam.xref_id}, ${fam.husband}`);
    }

    if (fam.xref_id && fam.wife) {
        famLinkParent(fam.xref_id, fam.wife, 'w');
    }
    else {
        console.log(`no famLinkParent wife for ${fam.xref_id}, ${fam.wife}`);
    }

    if (fam.children) {


        for (let index = 0; index < fam.children.length; index++) {
            const c = fam.children[index];

            if (fam.xref_id && c.xref_id) {
                famLinkChild(fam.xref_id, c.xref_id);
            }
            else {
                console.log(`no famLinkChild for ${fam.xref_id}, ${c.xref_id}`);
            }
        
            if (fam.xref_id && c.xref_id && fam.husband) {
                // linkChildParentDirect(driver, neo4jsession, fam.husband, c.xref_id);
            }

            if (fam.xref_id && c.xref_id && fam.wife) {
                // linkChildParentDirect(driver, neo4jsession, fam.wife, c.xref_id);
            }

        }
    }

    return node;
}

export async function famLinkParent(fam_id: string, person_id: string, ptype: string) {
    console.log(`famLinkParent() ${fam_id} ${person_id} ${ptype}`);

    let neo4jsession: Session | undefined;
    let node: Neo4jnode | undefined = undefined;

    const rel = ptype.toUpperCase(); // K W

    try {

        if (driver) {
            console.log('opening neo4jsession [family_relations]');
            neo4jsession = driver.session();
        }

        const result = await neo4jsession?.run(
            `
MATCH (f:Family {xref_id: '${fam_id}'})
MATCH (p:Person {xref_id: '${person_id}'})
CREATE (p)-[rel:${rel}]->(f)
            `,
            {}
            // { fam_id: fam_id, person_id: person_id } // not used?
        );

        // console.log(result);
    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [family_relations]');
            neo4jsession.close();
        }
        await sleepytime();
    }

}

export async function famLinkChild(fam_id: string, person_id: string) {
    console.log(`famLinkChild() ${fam_id} ${person_id}`);
    let neo4jsession: Session | undefined;
    let node: Neo4jnode | undefined = undefined;

    try {

        if (driver) {
            console.log('opening neo4jsession [famLinkChild]');
            neo4jsession = driver.session();
        }

        const result = await neo4jsession?.run(
            `
MATCH (f:Family {xref_id: '${fam_id}'})
MATCH (p:Person {xref_id: '${person_id}'})
CREATE (f)-[rel:CHILD]->(p)
            `,
            {}
            // { fam_id: fam_id, person_id: person_id } // not used?
        );

        // console.log(result);
    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [famLinkChild]');
            neo4jsession.close();
        }
        await sleepytime();
    }


    // MATCH path=(p:Person)-[:child]->(par)
}

export async function linkPersons(name1: string, rel: string, name2: string) {
    let neo4jsession: Session | undefined;
    if (driver) {
        console.log('opening neo4jsession [famLinkChild]');
        neo4jsession = driver.session();
    }

    const result = await neo4jsession?.run(
        `
MATCH (n1:Person {name: '${name1}'})
MATCH (n2:Person {name: '${name2}'})
CREATE (n1)-[rel:${rel}]->(n2)
        `,
        { name1: name1, name2: name2 }
    );

    console.log(result);
}

export async function linkChildParentDirect(parentId: string, childId: string) {
    console.log(`linkChildParentDirect() ${parentId} ${childId}`);
    let neo4jsession: Session | undefined;

    try {

        if (driver) {
            console.log('opening neo4jsession [child_direct]');
            neo4jsession = driver.session();
        }

        const mutation = `
        MATCH (cp:Person {xref_id: '${childId}'})
        MATCH (pp:Person {xref_id: '${parentId}'})
        CREATE (cp)-[rel:IS_CHILD]->(pp)
                `;
        console.log("mutation: ", mutation);

        // Neo4jError: ForsetiClient[transactionId=136773, clientId=4764] can't acquire ExclusiveLock{owner=ForsetiClient[transactionId=136772, clientId=4770]} on RELATIONSHIP(4166), because holders of that lock are waiting for ForsetiClient[transactionId=136773, clientId=4764].
        // Wait list:ExclusiveLock[
        // Client[136772] waits for [ForsetiClient[transactionId=136773, clientId=4764]]]
        // https://github.com/neo4j/neo4j/issues/6248
        // https://neo4j.com/docs/java-reference/current/transaction-management/#transactions-deadlocks
        // creating indexes seems to help
        const result = await neo4jsession?.run(
            mutation,
            {}
            // { childId: childId, parentId: parentId } // not used?
        );
    
        // console.log(result);

    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [child_direct]');
            neo4jsession.close();
        }

        await sleepytime();
    }

}

export async function indexCreation() {
    console.log(`indexCreation()`);
    let neo4jsession: Session | undefined;

    try {

        if (driver) {
            console.log('opening neo4jsession [indexCreation]');
            neo4jsession = driver.session();
        }

        const mutations = [
            // `DROP INDEX ix_person_xrefid `,
            // `DROP INDEX ix_person_name `,
            // `DROP INDEX ix_family_xrefid `,

            `CREATE INDEX ix_person_xrefid IF NOT EXISTS FOR (n:Person) ON (n.xref_id)`,
            `CREATE INDEX ix_person_name IF NOT EXISTS FOR (n:Person) ON (n.name)`,
            `CREATE INDEX ix_family_xrefid IF NOT EXISTS FOR (n:Family) ON (n.xref_id)`,
        ];

        for(let i=0; i < mutations.length; i++ ) {
            const mutation = mutations[i];
            console.log("mutation: ", mutation);
            if( neo4jsession ) {
                const result = await neo4jsession.run(
                    mutation,
                    { }
                );
                console.log(result);
            }
        }

    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [indexCreation]');
            neo4jsession.close();
        }

        await sleepytime();
    }

}

export async function sleepytime() {
    const sleeptime = 1000;
    // https://stackoverflow.com/a/38084640/408747
    await setTimeout(
        () => {
            console.log(`waiting ${sleeptime}...`);
        }
        , sleeptime
    );
}

export function appCloseHandler() {
    driver?.close();
}

export const mutation_fns: { [key: string]: Function } = {
    'createperson': (person: Person) => createPerson(person),
    'createfamily': (fam: Family) => createFamily(fam),
    // 'linkfamhusband': (fam_id: string, person_id: string, ptype: string) => famLinkParent(fam_id, person_id, 'k'),
    // 'linkfamwife': (fam_id: string, person_id: string, ptype: string) => famLinkParent(fam_id, person_id, 'w'),
    'linkfamchild': (fam_id: string, person_id: string) => famLinkChild(fam_id, person_id),
    'linkpersons': (name1: string, rel: string, name2: string) => linkPersons(name1, rel, name2),
    'linkchildparentdirect': (parentId: string, childId: string) => linkChildParentDirect(parentId, childId),
    'indexcreation': () => indexCreation(),
    'close': () => appCloseHandler(),
}
