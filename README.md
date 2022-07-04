
#  mookuauhau-backend / gedcomloader

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

# Hasura / graphql examples

## query one person by xref_id, return relations

- main query is an individual person
- makuahine means this kanaka is a mother in an ʻohana relationship
- makuakane means this kanaka is a father in an ʻohana relationship
- nakamalii is a list of children of this kanaka (ʻohana relationship)
- namakua is a list of makua this kanaka (other ʻohana relationships)


```
query kanakaByXrefidRelations($xref_id: String!) {
  kanaka(where: {xref_id: {_eq: $xref_id}}) {
    kanaka_id
    name
    sex
    residence
    birth_date
    birth_place
    xref_id
    mookuauhau_id
    namakua {
      kanaka {
        name
        xref_id
        sex
      }
    }
    makuakane {
      ohana_id
      xref_id
      kane_id
      wahine {
        kanaka_id
        name
        xref_id
      }
      nakamalii {
        kamalii_id
        kanaka {
          kanaka_id
          name
          xref_id
          sex
        }
      }
    }
    makuahine {
      ohana_id
      xref_id
      wahine_id
      kane {
        kanaka_id
        name
        xref_id
      }
      nakamalii {
        kamalii_id
        kanaka {
          kanaka_id
          name
          xref_id
          sex
        }
      }
    }
  }
}
```

parameters:

```
{"xref_id": "@I247@"}
```


## query filter by field

```
query kanakaSpecificBirthplace($mookuauhau_id:Int!, $birth_place:String!) {
  kanaka(where: {mookuauhau_id: {_eq: $mookuauhau_id}}, birth_place: {_eq: $birth_place}}) {
    kanaka_id
    name
    sex
    residence
    birth_date
    birth_place
    xref_id
    mookuauhau_id
    namakua {
      kanaka {
        name
        xref_id
        sex
      }
    }
    makuakane {
      ohana_id
      xref_id
      kane_id
      wahine {
        kanaka_id
        name
        xref_id
      }
      nakamalii {
        kamalii_id
        kanaka {
          kanaka_id
          name
          xref_id
          sex
        }
      }
    }
    makuahine {
      ohana_id
      xref_id
      wahine_id
      kane {
        kanaka_id
        name
        xref_id
      }
      nakamalii {
        kamalii_id
        kanaka {
          kanaka_id
          name
          xref_id
          sex
        }
      }
    }
  }
}
```

parameters:

```
{"mookuauhau_id": 101, "birth_place": "the Ololo Genealogy"}
```

## summary - totals of all record types in database

```
query m_summary {
  mookuauhau_aggregate {
    aggregate {
      count
    }
  }
  ohana_aggregate {
    aggregate {
      count
    }
  }
  kanaka_aggregate {
    aggregate {
      count
    }
  }
  kamalii_aggregate {
    aggregate {
      count
    }
  }
}
```

## Hasura + postgresql on docker 

https://hasura.io/docs/latest/graphql/core/deployment/deployment-guides/docker/

quickstart:
```
cd ./hasura-docker
{edit .env}
{edit docker-compose.yml}
docker-compose up -d
docker ps
```

Then you can connect to localhost:port for the Hasura endpoint as well as the postgresql you configured. 

The .env under ./hasura-docker can look like this:
```
HASURA_GRAPHQL_METADATA_DATABASE_URL=postgres://postgres:postgrespassword@postgres:5432/postgres
PG_DATABASE_URL=postgres://postgres:postgrespassword@postgres:5432/postgres
HASURA_GRAPHQL_ADMIN_SECRET=gottokeepasecret
JWT_SECRET_KEY=sharedsecretwithyourauthenticationprovider
HASURA_GRAPHQL_JWT_SECRET='{"type":"HS256", "key": "${JWT_SECRET_KEY}"}'
```


## Hasura mutations and metadata

creating new database schema, by applying all migrations 

```
cd ./hasura
hasura migrate --endpoint https://your.hasura.endpoint --admin-secret yoursecret  --database-name default status
hasura migrate --endpoint https://your.hasura.endpoint --admin-secret yoursecret  --database-name default apply
```

apply only 2 migrations 
```
hasura migrate --endpoint https://your.hasura.endpoint --admin-secret yoursecret  --database-name default apply --up 2
```

rollback 2 migrations 
```
hasura migrate --endpoint https://your.hasura.endpoint --admin-secret yoursecret  --database-name default apply --down 2
```

apply metadata from files to hasura instance (after viewing diff)
```
hasura metadata --endpoint https://your.hasura.endpoint --admin-secret yoursecret diff
hasura metadata --endpoint https://your.hasura.endpoint --admin-secret yoursecret apply
```

# system architecture

![software architecture diagram](static/moʻokūʻauhau-gedcom-loader.png?raw=true)


## generate 64 char string

useful to make a new jwt secret

`< /dev/urandom tr -dc \_A-Z-a-z-0-9 | head -c${1:-64};echo;`

