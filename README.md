
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

# Hasura / graphql examples

## query filter 

query kanakaSpecificBirthplace {
  kanaka(where: {birth_place: {_eq: "the Ololo Genealogy"}}) {
    kanaka_id
    name
    formal_name
    birth_place
    birth_date
    change_date
    makuakane {
      ohana_id
      nakamalii {
        kamalii_id
        kanaka {
          kanaka_id
          name
          xref_id
        }
        kanaka_id
      }
    }
    makuahine {
      ohana_id
      nakamalii {
        kamalii_id
        kanaka {
          kanaka_id
          name
          xref_id
        }
        ohana {
          ohana_id
          kanakakane {
            kanaka_id
            name
          }
          kanakawahine {
            kanaka_id
            name
          }
          xref_id
        }
      }
    }
    kamalii {
      kanaka_id
      kamalii_id
      ohana_id
      kanaka {
        kanaka_id
        name
        sex
        xref_id
      }
    }
  }
}

## delete all nodes and relations

if testing loads and wanting to delete all...

```
MATCH (n)
DETACH DELETE n
```

