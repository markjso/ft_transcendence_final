import { createDMRoom, createGroupRooms, createDirectRooms } from "../../../apicalls/ApiMessages";
import {
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  CloseButton,
  Form as RSForm,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  FormGroup,
  FormFeedback,
} from "reactstrap";
import { Form, redirect, useLoaderData, useNavigate, useSubmit } from "react-router-dom";
import { getAllUsers } from "../../../apicalls/ApiFriends";
import { useEffect, useState } from "react";

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
  email: string;
  image_url: string;
}

interface LoaderDataTypes {
  users: UserDetails[];
  username: string;
}

export async function loader({ request }: {request: Request}): Promise<LoaderDataTypes> {
  const url = new URL(request.url);
  const username = url.searchParams.get("username") || "";
  let users: UserDetails[] = [];

  try {
    if (username) users = await getAllUsers(username);
  } catch {
    throw new Response("", {
      status: 500,
      statusText: "Internal server error",
    });
  }
  return { users, username };
}

export async function action({ request }: {request: Request}) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const room = await createDMRoom(data.users as string);
  return redirect(`/chat/dm/${room.id}`);
}

const CreateRoom = () => {
  const loaderdata = useLoaderData() as LoaderDataTypes;
  const users = loaderdata.users
  const username = loaderdata.username
  const submit = useSubmit();
  const navigate = useNavigate();
  const [people, setPeople] = useState<UserDetails[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [modal, setModal] = useState(true);
  const modalToggler = () => setModal(!modal);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isInvalidRoomName, setIsInvalidRoomName] = useState<boolean>(false);

  useEffect(() => {
    if (!modal) navigate(`/chat`);
  }, [modal, navigate]);

  const handleCreateRoom = async () => {
    let room = null;

    if (people.length == 1) {
      try {
        room = await createDirectRooms(people[0].username);
      } catch {
        setErrorMessage("You can only message to friends");
        return;
      }
    } else if (people.length > 1) {
      if (!roomName) {
        setIsInvalidRoomName(true);
        return;
      }
      const usernames: string[] = [];
      for (let i = 0; i < people.length; i++) {
        usernames[i] = people[i].username;
      }
      room = await createGroupRooms(roomName, usernames);
    } else {
      setErrorMessage("need at least one user to create room");
    }
    if (room !== null) navigate(`/chat/${room.data.chatroom}`);
    else {
      setErrorMessage("could not create room");
    }
  };

  const handleAddUser = (user: UserDetails) => {
    if (!people.includes(user)) {
      setPeople((prevPeople) => [...prevPeople, user]);
      if (errorMessage) setErrorMessage("");
    } else setErrorMessage("Can not add user twice");
  };

  return (
    <Modal isOpen={modal} toggle={modalToggler} centered fullscreen="md">
      <ModalHeader toggle={modalToggler}>New message</ModalHeader>
      <ModalBody>
        {errorMessage && <small className="text-danger">{errorMessage}</small>}
        {people.length > 1 && (
          <FormGroup className="pb-2">
            <Input
              name="groupname"
              placeholder="Group Name"
              value={roomName}
              invalid={isInvalidRoomName}
              onChange={(event) => {
                setRoomName(event.target.value);
                isInvalidRoomName && setIsInvalidRoomName(false);
              }}
            />
            <FormFeedback>Pleases enter a group name</FormFeedback>
          </FormGroup>
        )}

        <div className="d-flex flex-row">
          <ListGroup horizontal>
            {people.length > 0 &&
              people.map((person) => (
                <ListGroupItem
                  key={person.id}
                  color="dark"
                  action
                  className="d-flex justify-content-between align-items-center p-1"
                >
                  <small>{person.username}</small>
                  <CloseButton onClick={() => setPeople(people.filter((p) => p !== person))}></CloseButton>
                </ListGroupItem>
              ))}
          </ListGroup>
        </div>

        <Form id="search-users" role="search">
          <Input
            name="username"
            placeholder="Search By Username"
            type="search"
            defaultValue={username}
            autoComplete="off"
            onChange={(event) => {
              const isFIrstSearch = username === null;
              submit(event.currentTarget.form, {
                replace: !isFIrstSearch,
              });
            }}
          />
        </Form>
        <RSForm
        >
          {users.length > 0 ? (
            users.map((user: UserDetails) => (
              <Button
                key={user.id}
                onClick={() => handleAddUser(user)}
                outline
                className="d-flex p-2 mt-2 justify-content-between border-0 align-items-center w-100"
              >
                <Row className="d-flex justify-content-left align-items-center">
                  <Col xs="auto">
                    <img
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", cursor: "pointer" }}
                      alt="Avatar"
                      src={user.image_url}
                    />
                  </Col>
                  <Col xs="auto">{user.username}</Col>
                </Row>
              </Button>
            ))
          ) : (
            <small>"No users found"</small>
          )}
          <Button
            block
            color="primary"
            disabled={people ? false : true}
            className="mt-3"
            onClick={() => handleCreateRoom()}
          >
            Chat
          </Button>
        </RSForm>
      </ModalBody>
    </Modal>
  );
};

export default CreateRoom;
