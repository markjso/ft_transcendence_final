import { useLoaderData } from "react-router-dom";
import { getFriendsList } from "../../../apicalls/ApiFriends";
import { ListGroup, ListGroupItem, Col } from "reactstrap";
import { useEffect } from "react";
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
  const data = await getFriendsList();
  const friends: [UserDetails] = data.friends;
  return friends;
}

export default function FriendList() {
  const friends = useLoaderData() as [UserDetails];

  return (
    <Col>
      <ListGroup>
        {friends && friends.length > 0 ? (
          friends.map((friend: UserDetails) => {
            return (
              <ListTemplate key ={friend.id} {...friend} />
            );
          })
        ) : (
          <ListGroupItem>No friends found</ListGroupItem>
        )}
      </ListGroup>
    </Col>
  );
}
