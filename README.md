
# gedcomloader

Usage:

```
npm run build
npm run load ../gedcom/mookuauhau.ged
```

# load to neo4j database .env file entries

```
MUTATION_MODE=neo4j
NEO4J_ENDPOINT=bolt://localhost
NEO4J_USER=yourusername
NEO4J_PASS=yourpassword
INSERT_MODE=true
```

# load to hasura graphql database .env file entries

```
MUTATION_MODE=graphql
GRAPHQL_ENDPOINT=https://something/v1/graphql
INSERT_MODE=true
```

# neo4j / Cypher examples

## query filter with edges

```
MATCH path=(p:Person {birth_place:'the Ololo Genealogy'})-->()
RETURN path
```

## delete all nodes and relations

if testing loads and wanting to delete all...

```
MATCH (n)
DETACH DELETE n
```

