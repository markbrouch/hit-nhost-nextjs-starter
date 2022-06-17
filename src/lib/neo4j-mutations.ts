
import { Driver, Session, Node as Neo4jnode } from 'neo4j-driver';
import { Family } from '../models/Family.js';
import { Person } from '../models/Person.js';

export async function createPerson(driver: Driver | undefined, neo4jsession: Session, person: Person): Promise<Neo4jnode | undefined> {
    console.log("createFamily()");
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

        const result = await neo4jsession.run(
            'CREATE (a:Person {' + Object.keys(params).map((x) => `${x}: $${x}`).join(', ') + '}) RETURN a',
            params
        );

        const singleRecord = result.records[0];
        let node = singleRecord.get(0);

        console.log(node.properties.name);

    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [individual]');
            neo4jsession.close();
        }
    }

    return node;
}

export async function createFamily(driver: Driver | undefined, neo4jsession: Session, fam: Family): Promise<Neo4jnode | undefined> {
    console.log("createFamily()");
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

        let params = {
            formal_name: fam.formal_name,
            xref_id: fam.xref_id,
            wife: fam.wife,
            husband: fam.husband,
        };

        const result = await neo4jsession.run(
            'CREATE (a:Family {' + Object.keys(params).map((x) => `${x}: $${x}`).join(', ') + '}) RETURN a',
            params
        );

        const singleRecord = result.records[0];
        node = singleRecord.get(0);

        console.log(node?.properties.name);

        if (fam.xref_id && fam.husband) {
            famLinkParent(neo4jsession, fam.xref_id, fam.husband);
        }
        if (fam.xref_id && fam.wife) {
            famLinkParent(neo4jsession, fam.xref_id, fam.wife);
        }

        if (fam.children) {
            fam.children.forEach((c) => {
                if (fam.xref_id && c.xref_id) {
                    famLinkChild(neo4jsession, fam.xref_id, c.xref_id);
                }
            });
        }

    } finally {
        if (neo4jsession) {
            console.log('closing neo4jsession [family]');
            neo4jsession.close();
        }
    }

    return node;

}

export async function famLinkParent(session: Session, fam_id: string, person_id: string) {
    console.log('famLinkParent()');
    const rel = 'parent';
    const result = await session.run(
        `
MATCH (f:Family {xref_id: '$fam_id'})
MATCH (p:Person {xref_id: '$person_id'})
CREATE (f)-[rel:${rel}]->(p)
        `,
        { fam_id: fam_id, person_id: person_id }
    );

    console.log(result);
}

export async function famLinkChild(session: Session, fam_id: string, person_id: string) {
    console.log('famLinkChild()');
    const rel = 'child';
    const result = await session.run(
        `
MATCH (f:Family {xref_id: '$fam_id'})
MATCH (p:Person {xref_id: '$person_id'})
CREATE (f)-[rel:${rel}]->(p)
        `,
        { fam_id: fam_id, person_id: person_id }
    );

    console.log(result);
}

export async function linkPersons(session: Session, name1: string, rel: string, name2: string) {
    const result = await session.run(
        `
MATCH (n1:Person {name: '${name1}'})
MATCH (n2:Person {name: '${name2}'})
CREATE (n1)-[rel:${rel}]->(n2)
        `,
        { name1: name1, name2: name2 }
    );

    console.log(result);
}

