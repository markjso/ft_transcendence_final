import React, { useState } from "react";
import { Container, Row, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { editRoom, leaveroom } from "../../../apicalls/ApiMessages";
import { useNavigate, Form as RForm } from "react-router-dom";
import { NavLink } from "react-router-dom";
import GroupImageUpdate from "./GroupImageUpdate";

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
  email: string;
  image_url: string;
}


interface RoomDets {
  id: number;
  image: string;
  name: string;
  isDirect: boolean;
  admin: string;
  users: UserDetails[];
  group_name: string;
}

interface EditProps {
  roomDets: RoomDets;
}

const Edit = (props: EditProps) => {
  const navigate = useNavigate();
  const [removeUsers, setRemoveUsers] = useState<number[]>([]);
  const loggedinUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [roomname, setRoomname] = useState<string>("");
  const users = props.roomDets.users;

  const handleEditChat = async () => {
    try {
      await editRoom(props.roomDets.group_name, removeUsers, roomname);
      navigate(".");
    } catch {
      console.log("error updating room");
    }
  };

  return (
    <Container className="p-2">
      {!props.roomDets.isDirect && <GroupImageUpdate id={props.roomDets.id} image={props.roomDets.image} group_name={props.roomDets.group_name}/>}
    
      {loggedinUser.id === props.roomDets.admin ? (
        <>
          <Form>
            <FormGroup row>
              <Label for="roomname" sm="auto">
                Room name
              </Label>
              <Col>
                <Input
                  id="roomname"
                  name="email"
                  placeholder={props.roomDets.name}
                  type="email"
                  value={roomname}
                  onChange={(e) => setRoomname(e.target.value)}
                />
              </Col>
            </FormGroup>
          </Form>

          <div>
            {users &&
              users.length > 0 &&
              users.map((user) => {
                return (
                  <>
                    <Row key={user.id} className="p-2">
                      <Col xs="5" className="d-flex align-items-center">
                        <NavLink to={`/profile/${user.username}`} className="text-decoration-none link-light">
                          <img
                            className="img-thumbnail"
                            style={{ width: "40px", height: "40px", cursor: "pointer" }}
                            alt={user.username + " image"}
                            src={user.image_url || "https://www.bootdey.com/img/Content/avatar/avatar5.png"}
                          ></img>
                        </NavLink>
                        <small className="ps-1">{user.username}</small>
                      </Col>

                      <Col xs="7" className="d-flex justify-content-end">
                        {removeUsers.find((id) => id === user.id) ? (
                          <Button
                            color="secondary"
                            onClick={() => setRemoveUsers(removeUsers.filter((ids) => ids !== user.id))}
                          >
                            <i>undo</i>
                          </Button>
                        ) : (
                          <Button
                            color="danger"
                            onClick={() => setRemoveUsers((ids) => [...ids, user.id])}
                            disabled={loggedinUser.id === user.id}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </>
                );
              })}
            <Row className="pt-2 d-flex justify-content-end align-items-center">
              <Col xs="auto">
                <Button
                  color="primary"
                  onClick={() => {
                    handleEditChat();
                  }}
                >
                  Submit
                </Button>
              </Col>
              <Col xs="auto">
                <RForm
                  method="post"
                  action="delete"
                  onSubmit={(event) => {
                    if (!confirm("please confirm that you want to delete this room.")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <Button color="danger" type="submit">
                    Delete Chat
                  </Button>
                </RForm>
              </Col>
            </Row>
          </div>
        </>
      ) : (
        <Row className="pt-2">
          <Col xs="12" className="d-flex justify-content-end">
          <RForm
                  method="post"
                  action="leave"
                  onSubmit={(event) => {
                    if (!confirm("please confirm that you want to leave this room.")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <Button color="danger" type="submit">
                    Leave Chat
                  </Button>
                </RForm>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Edit;
