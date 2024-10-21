import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate, Outlet } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import {
  Button,
  Col,
  Row,
  Card,
  Container,
  CardImg,
} from "reactstrap";
import { getUserDetails } from "../../../apicalls/ApiFriends";
import EditProfile from './editProfile';
import { UserDetails } from "../tournament/interfaces";

export async function loader() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const UserDets: UserDetails = await getUserDetails(user.username);
  return UserDets;
}

const Profile: React.FC = () => {
  const UserDets = useLoaderData() as UserDetails;
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(UserDets);
  const [navName, setNavName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const handleNicknameUpdate = (newNickname: string) => {
    setUserDetails((prevDetails) => {
      return { ...prevDetails, nickname: newNickname };
    });
  };

  const handleProfileUpdate = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUserDetails = await getUserDetails(user.username);
    setUserDetails(updatedUserDetails);
  };

  useEffect(() => {
    handleProfileUpdate();
  }, []);

  return (
    <Container fluid className="mt-5 d-flex justify-content-center">
      <Row className="justify-content-center g-0">
        <Col xs="auto">
          <Card className="text-center bg-black">
            <Row className="align-items-top">
              <Col xs="auto" className="text-center">
                <CardImg
                  alt="User Image"
                  className="rounded-circle img-thumbnail"
                  src={UserDets.image_url}
                  style={isMobile ? { width: '77px', height: '77px' }: { width: '150px', height: '150px' }}
                />
              </Col>
              <Col xs="auto">
                <Row className="align-items-top">
                  <Col xs="10" className="text-start text-light">
                    <h1>{`${UserDets.first_name} ${UserDets.last_name}`}</h1>
                    <h3>{UserDets.username}</h3>
                  </Col>
                  <Col xs="2" md="2">
                    <Button outline type="submit" onClick={() => toggleModal()}>
                      Edit
                    </Button>
                    <EditProfile
                      isOpen={isModalOpen}
                      toggle={toggleModal}
                      userDets={UserDets}
                      onProfileUpdate={() => setReload(!reload)}
                      onNicknameUpdate={handleNicknameUpdate}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
          <Row className="pt-2 mb-2">
            <Col className="d-flex justify-content-center">
              <Button
                block
                outline
                className="border-0 border-end rounded-0 rounded-start"
                onClick={() => {
                  navigate("friends");
                  setNavName("friends");
                }}
                active={navName === "friends"}
              >
                Friends
              </Button>
              <Button
                block
                outline
                className="border-0 border-end rounded-0"
                active={navName === "blocked"}
                onClick={() => {
                  navigate("blocked");
                  setNavName("blocked");
                }}
              >
                Blocked
              </Button>
              <Button
                block
                outline
                className="border-0 border-end rounded-0"
                active={navName === "userstats"}
                onClick={() => {
                  navigate("userstats");
                  setNavName("userstats");
                }}
              >
                Stats
              </Button>
              <Button
                block
                outline
                className="border-0 rounded-0 rounded-end"
                active={navName === "leaderboard"}
                onClick={() => {
                  navigate("leaderboard");
                  setNavName("leaderboard");
                }}
              >
                Leaderboard
              </Button>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col xs="12">
              <Outlet />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
