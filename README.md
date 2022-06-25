
# gedcomloader

Usage:

```
npm run build
npm run load ../gedcom/mookuauhau.ged
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

