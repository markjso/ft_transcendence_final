import axios, { AxiosError } from "axios";
import { redirect } from "react-router-dom";

interface Auser {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

interface LoaderProps {
  request: Request;
}

export async function loader(props: LoaderProps) {
  const url = new URL(props.request.url);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_CN_URL}/api/v1/auth/account/42/`, { code: code });
      if (response.status === 200) {
        const user: Auser = {
          id: response.data.id,
          username: response.data.username,
          full_name: response.data.full_name,
          email: response.data.email,
        };
        localStorage.clear();
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
        return redirect("/");
      }
    } catch (error) {
      let socialerror: string = "";
      let status: number | undefined = undefined;
      if (error instanceof AxiosError) {
        socialerror = error.response?.data;
        status = error.status;
      } else {
        socialerror = "unexpected error occured, try again later";
        status = 500;
        throw new Response("", {
          status: status,
          statusText: socialerror,
        });
      }
    }
  }
  return null;
}
