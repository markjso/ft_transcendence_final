import { Row, Col, Button } from "reactstrap";
import { NavLink } from "react-router-dom";
import Default from "../../../assets/icons/defaultProfilePic.png";
import { useWebSocketContext } from "../../../WebSocketContext";

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
  email: string;
  image_url: string;
}

const ListTemplate = (props: UserDetails) => {
  const { onlineUsers } = useWebSocketContext();

  const checkOnlineStatus = (friendId: number): boolean => {
    return onlineUsers.some((user) => user.userId === friendId);
  };

  return (
    <Button key={props.id} type="button" outline className="border-0">
      <NavLink to={`/profile/${props.username}`} className="text-decoration-none link-light">
        <Row>
          <Col xs="auto" xl="auto">
            <img
              className="rounded-circle img-thumbnail"
              style={{ width: "40px", height: "40px", cursor: "pointer" }}
              alt="Avatar"
              src={props.image_url || Default}
            />
          </Col>
          <Col xs="auto" xl="auto" className="d-flex justify-content-left align-items-center">
            <strong className={checkOnlineStatus(props.id) ? "text-success" : "text-light"}>{props.username}</strong>
          </Col>
        </Row>
      </NavLink>
    </Button>
  );
};

export default ListTemplate;
