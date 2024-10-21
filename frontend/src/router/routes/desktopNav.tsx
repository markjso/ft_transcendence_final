import { Container, Row, Col} from "reactstrap";
import { NavLink } from "react-router-dom";
import Logo from "./logo";
import { useAuth } from "./hooks/useAuth";

export default function DesktopNav() {
  const Auth = useAuth();
  const navstyle = " py-3 text-decoration-none d-flex justify-content-between align-items-center";

  return (
    <Container className="h-100 d-flex justify-content-between flex-column">
      <Row>
        <Col xs="auto">
          <Logo />
        </Col>
      </Row>
      <Row>
        <Col xs="auto">
          <NavLink
            to="profile"
            className={({ isActive }) => (
              isActive
                ? "active-link" : "link-light" ) + navstyle
            }
          >
            <i className="bi-house fs-1 px-3"></i>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="search"
            className={({ isActive }) => (
              isActive
                ? "active-link" : "link-light" ) + navstyle
            }
          >
            <i className="bi-search fs-1 px-3"></i>
            <span>Search</span>
          </NavLink>

          <NavLink
            to="chat"
            className={({ isActive }) => (
              isActive
                ? "active-link" : "link-light" ) + navstyle
            }
          >
            <i className="bi-chat fs-1 px-3"></i>
            <span>Messages</span>
          </NavLink>

          <NavLink
            to="local"
            className={({ isActive }) => (
              isActive
                ? "active-link" : "link-light" ) + navstyle
            }
          >
            <i className="bi-joystick fs-1 px-3"></i>
            <span>Local</span>
          </NavLink>

          <NavLink
            to="tournament"
            className={({ isActive }) => (
              isActive
                ? "active-link" : "link-light" ) + navstyle
            }
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
  );
}
