import { Row, Col } from "reactstrap";
import { NavLink } from "react-router-dom";
import MessagePopover from "./messagePopover";

interface MessageProps {
  message: MessageDets;
  id: number;
  image: boolean;
  roomID: string;
  sendGameInvite: (usernmae: string) => void;
}

interface SenderDets {
  email: string;
  first_name: string;
  id: number;
  is_online: boolean;
  last_name: string;
  username: string;
  image_url: string;
}

interface RoomDets {
  id: number;
  group_name: string;
  isDirect: boolean;
  users?: SenderDets[] | null;
}

interface MessageDets {
  id: number;
  message: string;
  room: RoomDets;
  sender: SenderDets;
  timestamp: string;
}

export function Message(props: MessageProps) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isUserSender = props.message.sender.username === user.username;

  return (
    <Row className={"h-auto p-0 m-0 d-flex " + (isUserSender && "justify-content-end")}>
      <Col xs="auto" className="align-items-center p-0" id={"ToolTip-" + props.id}>
        {!isUserSender && props.image && (
          <NavLink to={`/profile/${props.message.sender.username}`}>
            <img
              className="rounded-circle overflow-hidden d-inline-block me-2"
              style={{ width: "35px", height: "35px", cursor: "pointer" }}
              alt="Avatar"
              src={props.message.sender.image_url}
            />
          </NavLink>
        )}
        <p
          className={"text-white mb-0 " + (isUserSender ? "bg-primary rounded-start" : "bg-dark rounded-end")}
          style={{
            display: "inline-block",
            padding: "8px",
            marginLeft: isUserSender || props.image ? "0px" : "43px",
            wordWrap: "break-word",
            fontSize: "14px",
          }}
        >
          {props.message.message}
        </p>
      </Col>
      <Row className={props.image ? " mb-3 " : " mb-1 "}></Row>
      <MessagePopover
        roomID={props.roomID}
        id={props.id}
        sendername={props.message.sender.username}
        isUserSender={isUserSender}
        timestamp={props.message.timestamp}
        sendGameInvite={props.sendGameInvite}
      ></MessagePopover>
    </Row>
  );
}
