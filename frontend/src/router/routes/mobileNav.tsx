import { Navbar, NavbarToggler, Offcanvas, Container, Row, Col } from "reactstrap";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./logo";
import { useAuth } from "./hooks/useAuth";

export default function MobileNav() {
  const Auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      <Navbar dark fixed="top" className=" border border-dark border-0 border-bottom text-light h-auto">
        <Logo />
        <NavbarToggler onClick={toggle} />
        <Offcanvas toggle={toggle} isOpen={isOpen} className="bg-dark w-auto">
          <Container className="h-100 d-flex justify-content-between flex-column">
            <Row>
              <Col xs="auto">
                <Logo onClick={toggle} />
              </Col>
            </Row>
            <Row>
              <Col xs="auto">
                <NavLink
                  onClick={toggle}
                  to="profile"
                  className="py-3 text-decoration-none link-light d-flex justify-content-between align-items-center"
                >
                  <i className="bi-house fs-1 px-3"></i>
                  <span>Home</span>
                </NavLink>

                <NavLink
                  onClick={toggle}
                  to="search"
                  className="py-3 text-decoration-none link-light d-flex justify-content-between align-items-center"
                >
                  <i className="bi-search fs-1 px-3"></i>
                  <span>Search</span>
                </NavLink>

                <NavLink
                  onClick={toggle}
                  to="chat"
                  className="py-3 text-decoration-none link-light d-flex justify-content-between align-items-center"
                >
                  <i className="bi-chat fs-1 px-3"></i>
                  <span>Messages</span>
                </NavLink>

                <NavLink
                  onClick={toggle}
                  to="local"
                  className="py-3 text-decoration-none link-light d-flex justify-content-between align-items-center"
                >
                  <i className="bi-joystick fs-1 px-3"></i>
                  <span>Local</span>
                </NavLink>

                <NavLink
                  onClick={toggle}
                  to="tournament"
                  className="py-3 text-decoration-none link-light d-flex justify-content-between align-items-center"
                >
                  <i className="bi-controller fs-1 px-3"></i>
                  <span>Tournament</span>
                </NavLink>
              </Col>
            </Row>
            <Row>
              <Col>
                <NavLink
                  to=""
                  onClick={() => Auth?.logout()}
                  className="text-decoration-none link-light d-flex justify-content-between align-items-center"
                >
                  <i className="bi-box-arrow-left fs-1 px-3"></i>
                  <span>Logout</span>
                </NavLink>
              </Col>
            </Row>
          </Container>
        </Offcanvas>
      </Navbar>
    </>
  );
}
