import { Button, Row, Container } from "reactstrap";
import { useNavigate } from "react-router-dom";

const ChatIndex = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center text-white h-100">
      <Row>
          <h1>Your Messages</h1>
          <small>Send a message to start chat</small>
          <Button type="button" onClick={() => navigate("createRoom")}>Send message</Button>
      </Row>
    </Container>
  );
};

export default ChatIndex;
