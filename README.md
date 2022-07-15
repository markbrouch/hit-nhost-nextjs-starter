# mookuauhau-backend / gedcomloader

Backend code repository for the Moʻokūʻauhau project

- Hasura setup w/PostgreSQL migrations
- GEDCOM file loader (command line)

# system architecture

![software architecture diagram](static/moʻokūʻauhau-gedcom-loader.png?raw=true)

# database schema

![database schema diagram](static/mookuauhau-erd.png?raw=true)

# Usage

load a GEDCOM file on command line

```
npm run load ../gedcom/mookuauhau.ged
```

load a GEDCOM file which was loaded to the backend queue, in load_status==new

```
npm run queueload
```

# load to hasura graphql database .env file entries

```
HASURA_GRAPHQL_ENDPOINT=https://something/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=notmysecret
# for nhost.io auth+storage features
NHOST_BACKEND_URL=https://something
NHOST_ADMIN_SECRET=notmysecret
```

# Hasura / graphql examples

## query one person by xref_id, return relations

- main query is an individual person
- makuahine means this kanaka is a mother in an ʻohana relationship
- makuakane means this kanaka is a father in an ʻohana relationship
- nakamalii is a list of children of this kanaka (ʻohana relationship)
- namakua is a list of makua/parents this kanaka is a child of (other ʻohana relationships)

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
      ohana {
        ohana_id
        xref_id
        kane_id
        wahine_id
        kane {
          kanaka_id
          xref_id
          name
        }
        wahine {
          kanaka_id
          xref_id
          name
        }
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
        ohana {
          ohana_id
          xref_id
        }
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

result:

```
{
  "data": {
    "kanaka": [
      {
        "kanaka_id": 347,
        "name": "Mary Punapanawea /Adams/",
        "sex": "F",
        "residence": null,
        "birth_date": "28 Feb 1838",
        "birth_place": "Niu Hawaii",
        "xref_id": "@I247@",
        "mookuauhau_id": 101,
        "namakua": [
          {
            "ohana": {
              "ohana_id": 307,
              "xref_id": "@F207@",
              "kane_id": 328,
              "wahine_id": 342,
              "kane": {
                "kanaka_id": 328,
                "xref_id": "@I228@",
                "name": "Alexander /Adams/"
              },
              "wahine": {
                "kanaka_id": 342,
                "xref_id": "@I242@",
                "name": "Sarah Ulukaihonua /Harbottle/"
              }
            }
          }
        ],
        "makuakane": [],
        "makuahine": [
          {
            "ohana_id": 318,
            "xref_id": "@F218@",
            "wahine_id": 347,
            "kane": {
              "kanaka_id": 340,
              "name": "William /Auld/",
              "xref_id": "@I240@"
            },
            "nakamalii": []
          },
          {
            "ohana_id": 320,
            "xref_id": "@F220@",
            "wahine_id": 347,
            "kane": {
              "kanaka_id": 459,
              "name": "Edwin Harbottle /Boyd/",
              "xref_id": "@I359@"
            },
            "nakamalii": [
              {
                "kamalii_id": 502,
                "kanaka": {
                  "kanaka_id": 350,
                  "name": "Mary Euphrozine Hio /Boyd/",
                  "xref_id": "@I250@",
                  "sex": "F"
                }
              },
              {
                "kamalii_id": 503,
                "kanaka": {
                  "kanaka_id": 503,
                  "name": "James Aalapuna  Harbottle /Boyd/",
                  "xref_id": "@I403@",
                  "sex": "M"
                }
              },
              {
                "kamalii_id": 504,
                "kanaka": {
                  "kanaka_id": 464,
                  "name": "Edward Strehz /Boyd/",
                  "xref_id": "@I364@",
                  "sex": "M"
                }
              },
              {
                "kamalii_id": 505,
                "kanaka": {
                  "kanaka_id": 380,
                  "name": "Harriet /Boyd/",
                  "xref_id": "@I280@",
                  "sex": "F"
                }
              },
              {
                "kamalii_id": 506,
                "kanaka": {
                  "kanaka_id": 378,
                  "name": "Robert Napunako /Boyd/",
                  "xref_id": "@I278@",
                  "sex": "M"
                }
              },
              {
                "kamalii_id": 507,
                "kanaka": {
                  "kanaka_id": 382,
                  "name": "Caroline Hawea /Boyd/",
                  "xref_id": "@I282@",
                  "sex": "F"
                }
              },
              {
                "kamalii_id": 508,
                "kanaka": {
                  "kanaka_id": 427,
                  "name": "Charlotte Kealoha /Boyd/",
                  "xref_id": "@I327@",
                  "sex": "F"
                }
              },
              {
                "kamalii_id": 509,
                "kanaka": {
                  "kanaka_id": 344,
                  "name": "Sarah Kaleimoku /Boyd/",
                  "xref_id": "@I244@",
                  "sex": "F"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
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
HASURA_GRAPHQL_JWT_SECRET='{"type":"HS256", "key": "sharedsecretwithyourauthenticationprovider"}'
```

## deploy to docker swarm

This command will deploy to your local docker swarm stack, and process the .env file to the compose yml.

```
cd ./hasura-docker
docker stack deploy -c <(docker-compose config) mooku
docker service ls
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

# Neo4j - older import code

## load to neo4j database .env file entries

```
MUTATION_MODE=neo4j
NEO4J_ENDPOINT=bolt://localhost
NEO4J_USER=yourusername
NEO4J_PASS=yourpassword
INSERT_MODE=true
```

## neo4j / Cypher examples

### query filter with edges

```
MATCH path=(p:Person {birth_place:'the Ololo Genealogy'})-->()
RETURN path
```

### delete all nodes and relations

if testing loads and wanting to delete all...

```
MATCH (n)
DETACH DELETE n
```

## generate 64 char string

useful to make a new jwt secret

`< /dev/urandom tr -dc \_A-Z-a-z-0-9 | head -c${1:-64};echo;`
