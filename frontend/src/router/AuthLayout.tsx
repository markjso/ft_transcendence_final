import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./routes/hooks/useAuth";

export const AuthLayout = () => {
  const Auth = useAuth();

  return Auth?.isAuth ? (
    <Outlet />
  ) :
  (
    <Navigate to="/login" />
  );
};