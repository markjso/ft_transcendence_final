import { Card, CardImg, CardImgOverlay, CardTitle } from "reactstrap";
import teamImage from "../../assets/team.png"

export default function Index() {
  return (
    <Card inverse className="h-100 bg-black">
    <CardImg src={teamImage} alt="team picture" className="h-100 w-100"/>
    <CardImgOverlay>
    <CardTitle className="text-light d-flex justify-content-center align-items-center h-100">
      Welcome to
        Transcendence
    </CardTitle>
    </CardImgOverlay>
    </Card>
  );
}
