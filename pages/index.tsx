import {
  Badge,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { openModal } from "@mantine/modals";
import { gql, useQuery } from "@apollo/client";
import type { NextPage } from "next";
import RequestAccessModal from "../components/RequestAccessModal";

import { authProtected } from "../components/protected-route";

const Home: NextPage = () => {
  const MOOKUAUHAU_QUERY = gql`
    query Mookuauhau {
      mookuauhau_public {
        owner_id
        mookuauhau_id
        name
        visibility
      }
    }
  `;

  const { loading, data, error } = useQuery(MOOKUAUHAU_QUERY);

  return (
    <Container size="sm">
      <Title>Moʻokūʻauhau</Title>
      <Space h="lg"></Space>
      {loading && <Loader />}

      {data && (
        <Stack>
          {data.mookuauhau_public.map((item) => (
            <Paper key={item.mookuauhau_id} withBorder shadow="sm" p="md">
              <Group position="apart">
                <Stack>
                  <Group>
                    <Title>{item.name}</Title>
                    {item.visibility === "private" && (
                      <Badge color="red">private</Badge>
                    )}
                  </Group>
                  <Text>Owner: {item.owner_id}</Text>
                </Stack>
                {item.visibility === "private" ? (
                  <Button
                    onClick={() => {
                      openModal({
                        title: "Request Access",
                        children: (
                          <RequestAccessModal
                            mookuauhauId={item.mookuauhau_id}
                            ownerId={item.owner_id}
                          />
                        ),
                      });
                    }}
                  >
                    Request to view this tree
                  </Button>
                ) : (
                  <Button>View this tree</Button>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default authProtected(Home);
