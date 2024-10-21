import { Container, Row, Col, Button, Modal, ModalHeader } from "reactstrap";
import { useState } from "react";
import Edit from "./edit";
import { useNavigate } from "react-router-dom";

interface RoomDets {
  id: number;
  name: string;
  isDirect: boolean;
  admin: string;
  users: [];
  image: string;
  group_name: string;
}

interface HeaderProps {
  roomDets: RoomDets;
  online_count: number;
  className: string;
}
const Header = (props: HeaderProps) => {
  const [isEdit, SetIsEdit] = useState(false);
  const editToggle = () => SetIsEdit(!isEdit);
  const navigate = useNavigate()

  return (
    <Container className={props.className}>
      <Row className="w-100 align-items-center">
        <Col xs="6"  className="align-items-center">
          <Button onClick={() => navigate("/chat")} className="bg-black border-0">
            <i className="bi bi-arrow-return-left"></i>
          </Button>

          <img
            className="rounded-circle d-inline-block me-2"
            style={{ width: "35px", height: "35px" }}
            alt="Avatar"
            src={props.roomDets?.image}
          />
          <strong className={props.online_count >= 1 ? "text-success" : "text-light"}>{props.roomDets.name}</strong>
        </Col>

        {/* edit */}
        <Col xs="6" className="align-items-center d-flex justify-content-end p-0">
          <Button outline className="border-0 p-0" onClick={() => editToggle()}>
            <h4 className="bi bi-person-lines-fill"></h4>
          </Button>
        </Col>
      </Row>
      <Modal isOpen={isEdit} toggle={editToggle} centered>
        <ModalHeader toggle={editToggle}>Edit {props.roomDets.name}</ModalHeader>
        <Edit roomDets={props.roomDets}></Edit>
      </Modal>
    </Container>
  );
};

export default Header;