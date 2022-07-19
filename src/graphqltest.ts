
import { createFamily, createPerson, linkPersons } from './lib/mutations/graphql-mutations.js';
import { Family } from './models/Family.js';
import { Person } from './models/Person.js';

const role = 'public';
const jwt_token = '';

try {

    // const alice = await createPerson(new Person({name: 'Alice'}), role, jwt_token);
    // const lopaka = await createPerson(new Person({name: 'Lopaka'}), role, jwt_token);

    // await linkPersons(alice?.properties.name, 'follows', lopaka?.properties.name);

    const fam = await createFamily(new Family({
        xref_id: '@F0001@',
        husband: '@I25@',
        wife: '@I23@',
    }), undefined, role, jwt_token);


} finally {

}
