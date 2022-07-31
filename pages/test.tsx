import type { NextPage } from "next";
import { useState } from "react";

import { Container, Title } from "@mantine/core";
import { useAccessToken, useAuthenticated } from "@nhost/nextjs";

import { authProtected } from "../components/protected-route";
import { gql, useQuery } from "@apollo/client";

const MOOKUAUHAU_QUERY = gql`
  query Mookuauhau {
    mookuauhau {
      owner_id
      mookuauhau_id
      filename
      name
      visibility
    }
  }
`;

// * Reference: https://blog.codepen.io/2021/09/01/331-next-js-apollo-server-side-rendering-ssr/

const Home: NextPage = () => {
  const isAuthenticated = useAuthenticated();
  const accessToken = useAccessToken();
  const { loading, data, error } = useQuery(MOOKUAUHAU_QUERY);
  console.log(data);
  return (
    <Container>
      <Title>Index page</Title>
      {isAuthenticated ? <></> : <div>go to /sign-in</div>}

      <p>Access Token</p>
      <div>{accessToken}</div>
      {isAuthenticated && (
        <ul>
          {data?.mookuauhau.map((item) => (
            <li key={item.mookuauhau_id}>{item.name}</li>
          ))}
        </ul>
      )}
      {!loading && error && <div>ok {JSON.stringify(error)}</div>}
    </Container>
  );
};

// export default Home;
export default authProtected(Home);
