
# gedcomloader

Usage:

```
npm run build
npm run load ../gedcom/mookuauhau.ged
```

# delete all nodes and relations

if testing loads and wanting to delete all...

```
MATCH (n)
DETACH DELETE n
```
