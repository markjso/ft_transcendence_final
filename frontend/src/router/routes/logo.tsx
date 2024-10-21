import { NavLink } from "react-router-dom";
import logo from "../../assets/logoo.svg";

interface LogoProps {
  onClick?: () => void
}

export default function Logo(props: LogoProps) {
  return (
    <NavLink onClick={props.onClick} to="" className="w-80 d-flex justify-content-center">
      <img src={logo} alt="FT_TRANSCENDENCE" style={{ width: "150px", height: "90px" }}></img>
    </NavLink>
  );
}
