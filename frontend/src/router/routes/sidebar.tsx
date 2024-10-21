import { Container, Row, Col } from "reactstrap";
import { Outlet } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useMediaQuery } from "react-responsive";
import MobileNav from "./mobileNav";
import DesktopNav from "./desktopNav";
import "./game.css"
export default function SideBar() {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <Container
      fluid
      className="bg-black vh-100 vw-100"
    >
      <Row className="h-100">
        {isMobile ? (
          <>
            <Col style={{ height: "16%" }}>
              <MobileNav></MobileNav>
            </Col>

            <Col xs="12" style={{ height: "84%" }}>
              <Outlet></Outlet>
            </Col>
          </>
        ) : (
          // desktop
          <>
            <Col md="auto" className="vh-100 border border-dark border-0 border-end">
              <DesktopNav></DesktopNav>
            </Col>
            <Col className="vh-100">
              <Outlet></Outlet>
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
}
