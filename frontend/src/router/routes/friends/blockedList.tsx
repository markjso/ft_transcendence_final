import { useLoaderData, useNavigate } from "react-router-dom";
import { getBlockedList } from "../../../apicalls/ApiFriends";
import { ListGroup, ListGroupItem, Col, Button } from "reactstrap";
import { unblockUser } from "../../../apicalls/ApiFriends";
import { useEffect, useState } from "react";
import ListTemplate from "./ListTemplate";

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
  email: string;
  image_url: string;
}

export async function loader() {
  const blocksData = await getBlockedList();
  const blocks: [UserDetails] = blocksData.blocked_users;
  return blocks;
}

export default function BlockedList() {
  const blocks = useLoaderData() as [UserDetails];
  const [rerender, setRerender] = useState<boolean>(false);
  const navigate = useNavigate();
  const unBlockUser = async (username: string) => {
    if (username) {
      await unblockUser(username);
      setRerender(true);
    }
  };

  useEffect(() => {
    if (rerender) navigate(".");
  }, [rerender, navigate]);

  return (
    <Col>
      <ListGroup>
        {blocks && blocks.length > 0 ? (
          blocks.map((block) => {
            return (
              <div key={block.id}>
                {ListTemplate(block)}
                < Button color="primary" onClick={() => unBlockUser(block.username)}>
                  Unblock
                </Button>
              </div>
            );
          })
        ) : (
          <ListGroupItem>No one blocked yet</ListGroupItem>
        )}
      </ListGroup>
    </Col >
  );
}
