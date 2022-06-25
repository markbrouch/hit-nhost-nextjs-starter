import { gqlRequest, gql } from './graphql-client.js';
import { Family } from '../models/Family.js';
import { Person } from '../models/Person.js';

export async function createPerson(person: Person, role: string, jwt_token: string) {
    console.log("createPerson()");

    // if (!jwt_token) {
    //     return;
    // }

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
    mutation insert_single_Person($object: kanaka_insert_input!) {
        insert_kanaka_one(object: $object) {
            kanaka_id
            name
            xref_id
        }
    }
    `;
    const variables = {
        object: params,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    return await gqlRequest(query, variables, jwt_token, addHeaders);
}

export async function createFamily(fam: Family, role: string, jwt_token: string) {
    console.log("createFamily() ", fam.xref_id);

    // if (!jwt_token) {
    //     return;
    // }
    console.log("fam.xref_id : ", fam.xref_id);
    console.log("fam: ", fam);

    let params: { [key: string]: any } = {
        xref_id: fam.xref_id,
        formal_name: fam.formal_name,
    };
    if (fam.formal_name) { params.formal_name = fam.formal_name; }
    // if (fam.wife) { params.wahine_id = fam.wife; }
    // if (fam.husband) { params.kane_id = fam.husband; }

    const makuakane_kanaka = await get_kanaka_by_xrefid(fam.husband, role, jwt_token);
    const makuahine_kanaka = await get_kanaka_by_xrefid(fam.wife, role, jwt_token);
    console.log("makuakane_kanaka : ", makuakane_kanaka);
    console.log("makuahine_kanaka : ", makuahine_kanaka);
    const makuakane_kanaka_id = makuakane_kanaka?.kanaka[0].kanaka_id; // first only
    const makuahine_kanaka_id = makuahine_kanaka?.kanaka[0].kanaka_id; // first only
    if (makuakane_kanaka_id) { params.kane_id = makuakane_kanaka_id; }
    if (makuahine_kanaka_id) { params.wahine_id = makuahine_kanaka_id; }

    const query = gql`
    mutation insert_single_Ohana($object: ohana_insert_input!) {
        insert_ohana_one(object: $object) {
            ohana_id
            birth_place
            burial_place
            change_date
            formal_name
            kane_id
            marriage_date
            marriage_date_dt
            marriage_place
            owner_id
            residence
            residence_place
            source_uid
            wahine_id
            xref_id
        }
    }
    `;
    const variables = {
        object: params,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    const resultCreateOhana = await gqlRequest(query, variables, jwt_token, addHeaders);
    const ohana_id = resultCreateOhana?.insert_ohana_one.ohana_id;
    // console.log("resultCreateOhana : ", resultCreateOhana);
    console.log("ohana_id : ", ohana_id);

    // // relations / edges
 
    // if (fam.xref_id && fam.husband) {
    //     const makuakane = await famLinkHusband(ohana_id, makuakane_kanaka_id, role, jwt_token);
    // }
    // else {
    //     console.log(`no famLinkParent husband for ${fam.xref_id}, ${fam.husband}`);
    // }

    // if (fam.xref_id && fam.wife) {
    //     const makuahine = await famLinkWife(ohana_id, makuahine_kanaka_id, role, jwt_token);
    // }
    // else {
    //     console.log(`no famLinkParent wife for ${fam.xref_id}, ${fam.wife}`);
    // }

    if (fam.children) {
        console.log("iterating fam.children...");
        for (let index = 0; index < fam.children.length; index++) {
            const c = fam.children[index];

            console.log("fam.xref_id : ", fam.xref_id);
            console.log("c.xref_id: ", c.xref_id);

            if (fam.xref_id && c.xref_id) {
                const kamalii = await get_kanaka_by_xrefid(c.xref_id, role, jwt_token); 
                console.log("kamalii: ", kamalii);
                const kid = kamalii?.kanaka_id;
                console.log("kid: ", kid);
                const crv = await famLinkChild(ohana_id, kid, role, jwt_token);
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

export async function famLinkHusband(fam_id: string, person_id: string, role: string, jwt_token: string) {
    console.log(`famLinkHusband() ${fam_id} ${person_id}`);
    // const rel = ptype.toUpperCase(); // K | W

    // update mutation
    // update ohana set kane_id = x where ohana_id = y

    const query = gql`
    mutation update_ohana_kane_by_pk($ohana_id: Int!, $kane_id: Int!) {
        update_ohana_by_pk(pk_columns: {ohana_id: $ohana_id}, _set: {kane_id: $kane_id}) {
            ohana_id
            kane_id
        }
    }
    `;
    const variables = {
        ohana_id: fam_id,
        kane_id: person_id,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    return await gqlRequest(query, variables, jwt_token, addHeaders);
}

export async function famLinkWife(fam_id: string, person_id: string, role: string, jwt_token: string) {
    console.log(`famLinkWife() ${fam_id} ${person_id}`);
    // const rel = ptype.toUpperCase(); // K | W

    // update mutation
    // update ohana set kane_id = x where ohana_id = y

    const query = gql`
    mutation update_ohana_kane_by_pk($ohana_id: Int!, $wahine_id: Int!) {
        update_ohana_by_pk(pk_columns: {ohana_id: $ohana_id}, _set: {wahine_id: $wahine_id}) {
            ohana_id
            wahine_id
        }
    }
    `;
    const variables = {
        ohana_id: fam_id,
        wahine_id: person_id,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    return await gqlRequest(query, variables, jwt_token, addHeaders);
}

export async function get_ohana_by_pk(ohana_id: number, role: string, jwt_token: string) {
    console.log(`get_ohana_by_pk(${ohana_id}, role, jwt_token)`);

    const query = gql`
    query get_ohana_by_pk($ohana_id:Int!) {
        ohana_by_pk(ohana_id: $ohana_id) {
          birth_place
          burial_place
          change_date
          create_timestamp
          formal_name
          kane_id
          marriage_date
          marriage_date_dt
          ohana_id
          marriage_place
          owner_id
          residence
          residence_place
          source_uid
          wahine_id
          xref_id
        }
      }
    `;
    const variables = {
        ohana_id: ohana_id,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    return await gqlRequest(query, variables, jwt_token, addHeaders);
}

export async function get_kanaka_by_pk(kanaka_id: number, role: string, jwt_token: string) {
    console.log(`get_kanaka_by_pk(${kanaka_id}, role, jwt_token)`);

    const query = gql`
    query get_kanaka_by_pk($kanaka_id:Int!) {
        kanaka_by_pk(kanaka_id: $kanaka_id) {
          kanaka_id
          _uid
          birth_date
          birth_date_dt
          birth_place
          burial_place
          change_date
          family_child
          create_timestamp
          family_spouse
          formal_name
          name
          name_aka
          name_surname
          owner_id
          residence_place
          residence
          sex
          source_uid
          xref_id
        }
      }
    `;
    const variables = {
        kanaka_id: kanaka_id,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    return await gqlRequest(query, variables, jwt_token, addHeaders);
}

export async function get_kanaka_by_xrefid(xref_id: string|undefined, role: string, jwt_token: string) : Promise<any> {
    console.log(`get_kanaka_by_xrefid(${xref_id}, role, jwt_token)`);

    const query = gql`
    query get_kanaka_by_xrefid($xref_id:String!) {
        kanaka(where: {xref_id: {_eq: $xref_id}}) {
            kanaka_id
            _uid
            birth_date
            birth_date_dt
            birth_place
            burial_place
            change_date
            family_child
            create_timestamp
            family_spouse
            formal_name
            name
            name_aka
            name_surname
            owner_id
            residence_place
            residence
            sex
            source_uid
            xref_id
          }
    }
    `;
    const variables = {
        xref_id: xref_id,
    };

    let addHeaders = {
        "x-hasura-role": role
    };

    return await gqlRequest(query, variables, jwt_token, addHeaders);
}

export async function famLinkChild(fam_id: string|undefined, person_id: string, role: string, jwt_token: string) {
    console.log(`famLinkChild() ${fam_id} ${person_id}`);
    let kamalii_id: number|undefined;
    try {

        // lookup ohana_id from fam_id|xref_id
        // lookup kanaka_id from person_id|xref_id
        const kanakamatches = await get_kanaka_by_xrefid(person_id, role, jwt_token);
        const kanaka = kanakamatches[0];

        const query = gql`
        mutation insert_single_Child($object: kamalii_insert_input!) {
            insert_kamalii_one(object: $object) {
                kamalii_id
                kanaka_id
                ohana_id
                sex
                xref_id
            }
        }
        `;
        const variables = {
            object: {
                kanaka_id: person_id,
                ohana_id: fam_id,
                owner_id: null,
                sex: kanaka?.sex,
                // xref_id: null,
            }
        };
    
        let addHeaders = {
            "x-hasura-role": role
        };
    
        kamalii_id = await gqlRequest(query, variables, jwt_token, addHeaders);

    } finally {
        await sleepytime();
    }

    return kamalii_id;
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

export function appCloseHandler() {

}

export const mutation_fns: { [key: string]: Function } = {
    'createperson': (person: Person, role: string, jwt_token: string) => createPerson(person, role, jwt_token),
    'createfamily': (fam: Family, role: string, jwt_token: string) => createFamily(fam, role, jwt_token),
    // 'linkfamparent': (fam_id: string, person_id: string, ptype: string, role: string, jwt_token: string) => famLinkParent(fam_id, person_id, ptype),
    // 'linkfamhusband': (fam_id: string, person_id: string, ptype: string, role: string, jwt_token: string) => famLinkHusband(fam_id, person_id, role, jwt_token),
    // 'linkfamwife': (fam_id: string, person_id: string, ptype: string, role: string, jwt_token: string) => famLinkWife(fam_id, person_id, role, jwt_token),
    'linkfamchild': (fam_id: string, person_id: string, role: string, jwt_token: string) => famLinkChild(fam_id, person_id, role, jwt_token),
    'linkpersons': (name1: string, rel: string, name2: string) => linkPersons(name1, rel, name2),
    'linkchildparentdirect': (parentId: string, childId: string) => linkChildParentDirect(parentId, childId),
    'indexcreation': () => console.log('no op'),
    'close': () => appCloseHandler(),
}
