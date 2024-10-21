import React, { useState } from "react";
import { useLoaderData, useNavigate, Outlet } from "react-router-dom";
import { getUserDetails, addFriend, removeFriend, getFriendsList, blockUser, unblockUser, getBlockedList } from "../../../apicalls/ApiFriends.ts";
import { Button, Col, Row, Card, Container, CardImg } from "reactstrap";
import { createDirectRooms } from "../../../apicalls/ApiMessages.ts";
import { useMediaQuery } from "react-responsive";

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url: string;
}

interface LoaderData {
  user: UserDetails;
  isFriend: boolean;
  isBlocked: boolean;
}

export const loader = async ({ params }) => {
  const user = await getUserDetails(params.username);
  const friendsData = await getFriendsList();
  const friends: [UserDetails] = friendsData.friends;
  const friendUsernames = friends.map(friend => friend.username);
  const isFriend = (friendUsernames.includes(params.username));

  const blocksData = await getBlockedList();
  const blocks: [UserDetails] = blocksData.blocked_users;
  const blockUsernames = blocks.map(block => block.username);
  const isBlocked = (blockUsernames.includes(params.username));
  return { user, isFriend, isBlocked };
}

const FriendProfile: React.FC = () => {
  const { user, isFriend: initialIsFriend, isBlocked: initialIsBlocked } = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const [isFriend, setIsFriend] = useState<boolean>(initialIsFriend)
  const [isBlocked, setIsBlocked] = useState<boolean>(initialIsBlocked)
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const handleAddFriend = async () => {
    await addFriend(user.username);
    setIsFriend(true);
  };

  const handleRemoveFriend = async () => {
    await removeFriend(user.username);
    setIsFriend(false)
  };

  const handleBlockFriend = async () => {
    await blockUser(user.username);
    setIsBlocked(true);
  };

  const handleUnblockFriend = async () => {
    await unblockUser(user.username);
    setIsBlocked(false);
  };

  const handleMessage = async () => {
    try {
      const room = await createDirectRooms(user.username)
      if (room.status === 201 || room.status === 200) {
        navigate(`/chat/${room.data.chatroom}`)
      }
    } catch {
      setErrorMessage("You can only message to friends")
    }
  }

  return (
    <Container fluid className="mt-5 d-flex justify-content-center">
      <Row className="justify-content-center">
        <Col xs="auto">
          <Card className="text-center bg-black">
            <Row className="align-items-top g-0">
              <Col xs="auto" className="text-center">
                <CardImg
                  alt="User Image"
                  className="rounded-circle img-thumbnail"
                  src={user.image_url}
                  style={isMobile ? { width: '77px', height: '77px' }: { width: '150px', height: '150px' }}
                />
              </Col>
              <Col xs="7" md="7" className="text-start text-light ps-4">
                <h2>{`${user.first_name} ${user.last_name}`}</h2>
                <h3>{user.username}</h3>
              </Col>
            </Row>
          </Card>
          <Row className="pt-2 mb-2 g-0">
            <Col className="d-flex justify-content-center">
              {isFriend ? (
                <Button block onClick={() => handleRemoveFriend()} className="me-1">
                  Unfriend
                </Button>
              ) : (
                <Button block onClick={() => handleAddFriend()} color="primary" className="me-1">
                  Friend
                </Button>
              )}
              <Button block onClick={() => handleMessage()} color="info" className="me-1">Message</Button>
              {isBlocked ? (
                <Button block onClick={() => handleUnblockFriend()} color="info" className="me-1">
                  Unblock
                </Button>
              ) : (
                <Button block onClick={() => handleBlockFriend()} className="me-1">
                  Block
                </Button>
              )}
              <Button
              block
              className="me-1"
              onClick={() => { 
                navigate("matchhistory"); 
                }} 
                >
                Stats
              </Button>
              <Button onClick={() => window.history.back()}>Back</Button>            </Col>
          </Row>
          <Row className="mt-2">
            <Col xs="12">
              <Outlet />
        </Col>
      </Row> 
      </Col>
      </Row>
      {errorMessage && <small className="text-danger">{errorMessage}</small>}
      </Container>
  );
};

export default FriendProfile;