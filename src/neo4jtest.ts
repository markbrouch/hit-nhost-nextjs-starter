
import { driver as neo4jdriver, auth as neo4jauth } from 'neo4j-driver';
import { createPerson, linkPersons } from './lib/mutations/neo4j-mutations.js';
import { Person } from './models/Person.js';

const NEO4J_ENDPOINT = process.env.NEO4J_ENDPOINT || 'bolt://localhost';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASS || '';

const driver = neo4jdriver(NEO4J_ENDPOINT, neo4jauth.basic(NEO4J_USER, NEO4J_PASS));
const session = driver.session()

try {

    const alice = await createPerson(new Person({name: 'Alice', xref_id: '1'}));
    const lopaka = await createPerson(new Person({name: 'Lopaka', xref_id: '2'}));

    await linkPersons(alice?.properties.name, 'follows', lopaka?.properties.name);

} finally {
    await session.close()
}

// on application exit:
await driver.close()
