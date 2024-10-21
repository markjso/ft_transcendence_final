import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { AxiosInstance } from "../Authentication/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const FRIEND_URL = `/friend`;

interface BlockUserProps {
  username: string;
  roomID: string;
}

const BlockUser = (props: BlockUserProps) => {
  const [modal, setModal] = useState(true);
  const navigate = useNavigate()

  const toggle = () => setModal(!modal);

  const handleBlock = async () => {
    try {
      await AxiosInstance.post(`${FRIEND_URL}/block/${props.username}/`).then((res) => {
        if (res.status === 201) {
          navigate(`/chat/${props.roomID}`)
          toggle();
        }
      });
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  return (
    <Modal centered fade backdrop isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>{"Block " + props.username}</ModalHeader>
      <ModalBody>
        Are you sure you want to block this user? Once you block the user, you will not be able view any of their
        messages.
        <br />
        <Button block onClick={() => handleBlock()} color="danger">
          Block
        </Button>
      </ModalBody>
    </Modal>
  );
};

export default BlockUser;
