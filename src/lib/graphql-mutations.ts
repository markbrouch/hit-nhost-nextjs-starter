import { gqlRequest, gql } from './graphql-client.js';
import { Family } from '../models/Family.js';
import { Person } from '../models/Person.js';

export async function createPerson(person: Person, role: string, jwt_token: string) {
    console.log("createPerson()");

    if (!jwt_token) {
        return;
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

    const query = gql`
    mutation insert_single_Person($object: person_insert_input!) {
        insert_person_one(object: $object) {
            id
        }
    }
    `;
    const variables = {
        object: person,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    return await gqlRequest(query, variables, jwt_token, addHeaders);
}

export async function createFamily(fam: Family, role: string, jwt_token: string) {
    console.log("createFamily()");

    if (!jwt_token) {
        return;
    }

    let params: { [key: string]: any } = {
        xref_id: fam.xref_id,
        formal_name: fam.formal_name,
    };
    if (fam.formal_name) { params.formal_name = fam.formal_name; }
    if (fam.wife) { params.wife = fam.wife; }
    if (fam.husband) { params.husband = fam.husband; }

    const query = gql`
    mutation insert_single_Person($object: person_insert_input!) {
        insert_person_one(object: $object) {
            id
        }
    }
    `;
    const variables = {
        object: fam,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    await gqlRequest(query, variables, jwt_token, addHeaders);

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
                // linkChildParentDirect(fam.husband, c.xref_id);
            }

            if (fam.xref_id && c.xref_id && fam.wife) {
                // linkChildParentDirect(fam.wife, c.xref_id);
            }

        }
    }

}

export async function famLinkParent(fam_id: string, person_id: string, ptype: string) {
    console.log(`famLinkParent() ${fam_id} ${person_id} ${ptype}`);
//     const rel = ptype.toUpperCase(); // K W

//     try {

//         const result = await neo4jsession.run(
//             `
// MATCH (f:Family {xref_id: '${fam_id}'})
// MATCH (p:Person {xref_id: '${person_id}'})
// CREATE (p)-[rel:${rel}]->(f)
//             `,
//             {}
//             // { fam_id: fam_id, person_id: person_id } // not used?
//         );

//         // console.log(result);
//     } finally {
//         if (neo4jsession) {
//             console.log('closing neo4jsession [family_relations]');
//             neo4jsession.close();
//         }
//         await sleepytime();
//     }

}

export async function famLinkChild(fam_id: string, person_id: string) {
    console.log(`famLinkChild() ${fam_id} ${person_id}`);
//     try {

//         if (driver) {
//             console.log('opening neo4jsession [famLinkChild]');
//             neo4jsession = driver.session();
//         }

//         const result = await neo4jsession.run(
//             `
// MATCH (f:Family {xref_id: '${fam_id}'})
// MATCH (p:Person {xref_id: '${person_id}'})
// CREATE (f)-[rel:CHILD]->(p)
//             `,
//             {}
//             // { fam_id: fam_id, person_id: person_id } // not used?
//         );

//         // console.log(result);
//     } finally {
//         if (neo4jsession) {
//             console.log('closing neo4jsession [famLinkChild]');
//             neo4jsession.close();
//         }
//         await sleepytime();
//     }


//     // MATCH path=(p:Person)-[:child]->(par)
}

export async function linkPersons(name1: string, rel: string, name2: string) {
//     const result = await session.run(
//         `
// MATCH (n1:Person {name: '${name1}'})
// MATCH (n2:Person {name: '${name2}'})
// CREATE (n1)-[rel:${rel}]->(n2)
//         `,
//         { name1: name1, name2: name2 }
//     );

//     console.log(result);
}

export async function linkChildParentDirect(parentId: string, childId: string) {
    console.log(`linkChildParentDirect() ${parentId} ${childId}`);
    // try {

    //     if (driver) {
    //         console.log('opening neo4jsession [child_direct]');
    //         neo4jsession = driver.session();
    //     }

    //     const mutation = `
    //     MATCH (cp:Person {xref_id: '${childId}'})
    //     MATCH (pp:Person {xref_id: '${parentId}'})
    //     CREATE (cp)-[rel:IS_CHILD]->(pp)
    //             `;
    //     console.log("mutation: ", mutation);

    //     // Neo4jError: ForsetiClient[transactionId=136773, clientId=4764] can't acquire ExclusiveLock{owner=ForsetiClient[transactionId=136772, clientId=4770]} on RELATIONSHIP(4166), because holders of that lock are waiting for ForsetiClient[transactionId=136773, clientId=4764].
    //     // Wait list:ExclusiveLock[
    //     // Client[136772] waits for [ForsetiClient[transactionId=136773, clientId=4764]]]
    //     // https://github.com/neo4j/neo4j/issues/6248
    //     // https://neo4j.com/docs/java-reference/current/transaction-management/#transactions-deadlocks
    //     // creating indexes seems to help
    //     const result = await neo4jsession.run(
    //         mutation,
    //         {}
    //         // { childId: childId, parentId: parentId } // not used?
    //     );
    
    //     // console.log(result);

    // } finally {
    //     if (neo4jsession) {
    //         console.log('closing neo4jsession [child_direct]');
    //         neo4jsession.close();
    //     }

    //     await sleepytime();
    // }

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

