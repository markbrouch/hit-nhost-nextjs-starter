import {
  Button,
  Checkbox,
  List,
  LoadingOverlay,
  Space,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { closeModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { gql, useMutation } from "@apollo/client";
import { IconCheck, IconX } from "@tabler/icons";
import { useUserId } from "@nhost/react";

const REQUEST_ACCESS_MUTATION = gql`
  mutation RequestAccess(
    $mookuauhauId: Int!
    $requesterId: uuid!
    $ownerId: uuid!
    $name: String!
    $connection: String!
    $purpose: String!
    $typeOfData: String!
  ) {
    insert_accessrequest_one(
      object: {
        mookuauhau_id: $mookuauhauId
        requester_id: $requesterId
        owner_id: $ownerId
        name: $name
        connection: $connection
        purpose: $purpose
        type_of_data: $typeOfData
      }
    ) {
      connection
      mookuauhau_id
      name
      owner_id
      purpose
      requester_id
      type_of_data
    }
  }
`;

const RequestAccessModal = ({ mookuauhauId, ownerId }) => {
  const userId = useUserId();
  const [mutateRequestAccess, { loading, error }] = useMutation(
    REQUEST_ACCESS_MUTATION
  );

  const { onSubmit, getInputProps } = useForm({
    initialValues: {
      name: "",
      connection: "",
      purpose: "",
      typeOfData: "",
      agree: false,
    },
  });

  const handleSubmit = async (values) => {
    console.log(userId);
    await mutateRequestAccess({
      variables: {
        mookuauhauId,
        requesterId: userId,
        ownerId,
        name: values.name,
        connection: values.connection,
        purpose: values.purpose,
        typeOfData: values.typeOfData,
      },
    });
    closeModal(this);
    showNotification({
      icon: <IconCheck />,
      message: "Request sent",
      color: "green",
    });
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <form onSubmit={onSubmit(handleSubmit)}>
        <TextInput
          label="Your name"
          required
          placeholder="Your name"
          {...getInputProps("name")}
        />
        <Space h="md" />
        <Textarea
          label="Pilina - Connection"
          required
          description="Describe your connection to this data or family, include full names and life details if possible. Mo'okū'auhau owner will use the information compare to the family tree. Types of connection verification may include a paragraph in which you detail your familial or ʻāina ties including your personal details."
          {...getInputProps("connection")}
        />
        <Space h="md" />
        <Textarea
          label="Kumu - Purpose & Intention"
          required
          description="Describe the reasons you are requesting this data and what your future intentions are. Be as detailed as you can. (Examples: Personal research, legal research for Kuleana Land claim)"
          {...getInputProps("purpose")}
        />
        <Space h="md" />
        <Textarea
          label="ʻIkepili- Request generational level & data type"
          required
          description="For example: How many generations, what kinds of personal details, what kinds of materials, etc."
          {...getInputProps("typeOfData")}
        />
        <Space h="lg" />
        <Text size="sm">
          Your usage of the data is limited by permission requested:
          <List
            size="sm"
            spacing="xs"
            center
            icon={<IconCheck color="green" size={16} />}
          >
            <List.Item>
              Personal: For requester and immediate family only
            </List.Item>
            <List.Item>
              Research: For credible educational research (school projects,
              theses)
            </List.Item>
            <List.Item>Legal: For private legal use only</List.Item>
            <List.Item>Public: For public use</List.Item>
          </List>
        </Text>
        <Space h="md" />
        <Text size="sm">
          Your sharing of the data is limited by the following:
          <List
            size="sm"
            center
            spacing="xs"
            icon={<IconX color="red" size={16} />}
          >
            <List.Item>may not be sold or used for monetary gain</List.Item>
            <List.Item>
              may not be shared with a 3rd party information sharing websites
            </List.Item>
            <List.Item>
              cannot be altered (ie. by seperating or omitting data.) If sharing
              is permitted, moʻokūʻauhau will be shared in its entirety and in
              its original language. The only exception is if a translation has
              been approved by mo’okūʻauhau owner.
            </List.Item>
          </List>
        </Text>
        <Space h="lg" />
        <Checkbox
          label="I agree"
          {...getInputProps("agree", { type: "checkbox" })}
        />
        <Space h="md" />
        <Button type="submit">Submit</Button>
      </form>
    </>
  );
};

export default RequestAccessModal;
