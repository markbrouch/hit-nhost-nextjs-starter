import {
  Button,
  Container,
  Group,
  Header,
  MantineProvider,
  Title,
} from "@mantine/core";
import { useAuthenticated, useSignOut } from "@nhost/nextjs";

const AppHeader = () => {
  const isAuthenticated = useAuthenticated();
  const { signOut } = useSignOut();

  return (
    <Header height={50}>
      <Container fluid>
        <Group position="apart">
          <Title>Nolaila</Title>
          {isAuthenticated && <Button onClick={signOut}>Sign out</Button>}
        </Group>
      </Container>
    </Header>
  );
};

export default AppHeader;
