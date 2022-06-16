
import { driver as neo4jdriver, auth as neo4jauth } from 'neo4j-driver';

const NEO4J_ENDPOINT = process.env.NEO4J_ENDPOINT || 'bolt://localhost';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASS || '';

const driver = neo4jdriver(NEO4J_ENDPOINT, neo4jauth.basic(NEO4J_USER, NEO4J_PASS));
const session = driver.session()
const personName = 'Alice'

try {
  const result = await session.run(
    'CREATE (a:Person {name: $name}) RETURN a',
    { name: personName }
  )

  const singleRecord = result.records[0]
  const node = singleRecord.get(0)

  console.log(node.properties.name)
} finally {
  await session.close()
}

// on application exit:
await driver.close()
