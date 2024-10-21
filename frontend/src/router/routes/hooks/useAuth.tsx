import { useState, useContext, createContext, useLayoutEffect } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import { AxiosInstance } from "../Authentication/utils";

interface Auser {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

export async function loader(): Promise<boolean> {
  let isAuth = false;
  try {
    const res = await AxiosInstance.get(`/v1/auth/JWT-test/`);
    if (res.status === 200) isAuth = true;
  } catch {
    isAuth = false;
  }
  return isAuth
}

interface AuthContextType {
  isAuth: boolean;
  login: (user: Auser, access_token: string, refresh_token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider() {
  const isAuth = useLoaderData() as boolean;

  return (
    <AuthContext.Provider value={AuthValue(isAuth)}>
      <Outlet></Outlet>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

type AuthReturnType = {
  isAuth: boolean;
  login: (user: Auser, access_token: string, refresh_token: string) => Promise<boolean>;
  logout: () => void;
};

function AuthValue(isJWTAuth: boolean): AuthReturnType {
  const [isAuth, setIsAuth] = useState<boolean>(isJWTAuth);
  // const [token, setToken] = useState<string>(localStorage.getItem('access_token'))

  const login = async (user: Auser, access_token: string, refresh_token: string) => {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));
    // setToken(access_token);
    setIsAuth(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    setIsAuth(false);
  };

  useLayoutEffect(() => {
    if (!!localStorage.getItem("access_token") && isJWTAuth) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, [isJWTAuth]);

  return {
    isAuth,
    // token,
    login,
    logout,
  };
}
