import { useState } from "react";
import { getRooms } from "../../../apicalls/ApiMessages";
import { Col, Row, ListGroupItem, Button } from "reactstrap";
import { NavLink, Outlet, useLoaderData } from "react-router-dom";
import { AxiosError } from "axios";

interface RoomDets {
  id: number;
  image: string;
  name: string;
  isDirect: boolean;
  admin: string;
  users: [];
  group_name: string;
}

export async function loader() {
  try {
    const rooms = await getRooms();
    return rooms;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 500)
        throw new Response("", {
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      else {
        throw new Response("", {
          statusText: "an unexpected error occured try again later",
        });
      }
    }
  }
  return null;
}

const ChatList = () => {
  const [activeRoomID, setActiveRoomID] = useState<number>();
  const rooms = useLoaderData() as [RoomDets];

  return (
    <Row className="h-100">
      <Col xs="12" sm="auto" className="border border-dark border-0 border-end px-md-2 h-100">
        <Row className="h-auto pt-2" style={{ height: "10%" }}>
          {/* this is the header */}
          <div className="d-flex justify-content-between align-items-center text-white font-weight-bold">
            <h1>Messages</h1>
            <NavLink className="link-light ps-3" to="createRoom">
              <h3 className="bi bi-pencil-square"></h3>
            </NavLink>
          </div>
        </Row>

        <Row className="overflow-auto flex-grow-1 px-1" style={{ height: "90%" }}>
          <Col>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <NavLink
                  key={room.id}
                  className="link-underline link-underline-opacity-0 w-100 p-2 bg-black"
                  to={room.group_name}
                >
                  <Button
                    color="dark"
                    onClick={() => setActiveRoomID(room.id)}
                    outline
                    active={room.id === activeRoomID}
                    className="d-flex text-light p-2 border-0 align-items-center w-100"
                  >
                    {room?.image ? (
                      <img
                        className="rounded-circle overflow-hidden d-inline-block me-2"
                        style={{ width: "35px", height: "35px" }}
                        alt="Avatar"
                        src={room?.image}
                      />
                    ) : (
                      <i className="bi bi-people"></i>
                    )}
                    <span>{room.name}</span>
                  </Button>
                </NavLink>
              ))
            ) : (
              <ListGroupItem className="d-flex text-light justify-content-between border-0 align-items-center">
                No rooms found
              </ListGroupItem>
            )}
          </Col>
        </Row>
      </Col>

      <Col className="d-none d-sm-block h-100">
        <Outlet />
      </Col>
    </Row>
  );
};

export default ChatList;
