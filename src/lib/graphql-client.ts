
import { gql, GraphQLClient } from 'graphql-request';

const graphqlClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT || '');

async function gqlRequest(query: string, variables: { [key: string]: any }, jwt_token: string, addHeaders: { [key: string]: string }) {
    let gqlRequestHeaders: { [key: string]: string } = {
        "Content-Type": "application/graphql",
        'Accept': "application/json",
    };

	if(jwt_token) {
		gqlRequestHeaders['Authorization'] = `Bearer ${jwt_token}`;
	}
	if(addHeaders) {
		Object.keys(addHeaders).forEach(key => {
			gqlRequestHeaders[key] = addHeaders[key];
		});
	}

	console.log("gqlRequestHeaders: ", gqlRequestHeaders);

	// select which endpoint
	const client = graphqlClient;

	// console.log("client.url: ", client.url);
	console.log("process.env.GRAPHQL_ENDPOINT: ", process.env.GRAPHQL_ENDPOINT);

	return await client.request(query, variables, gqlRequestHeaders);
}

export { gqlRequest, graphqlClient, gql };
