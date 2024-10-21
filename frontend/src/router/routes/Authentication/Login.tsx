import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Form, Button, Alert, Row, Col } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { InputFields, SocialSignInButton } from "./utils";
import FormTemplate from "./FormTemplate.tsx";
import fortytwo from "../../../assets/42_Logo.png"
import { useAuth } from "../hooks/useAuth.tsx";

interface UserProps {
  email: string;
  password: string;
  showPassword: boolean;
}

interface Auser {
  id: number;
  username: string;
  full_name: string;
  email: string;
}

const Login = () => {
  const Auth = useAuth();
  const [formData, setFormData] = useState<UserProps>({
    email: "",
    password: "",
    showPassword: false,
  });
  const { email, password } = formData;
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<string>("");

  const handleShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_CN_URL}/api/v1/auth/login/`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        const auser: Auser = {
          id: response.data.id,
          username: response.data.username,
          full_name: response.data.full_name,
          email: response.data.email,
        };
        if (await Auth?.login(auser, response.data.access_token, response.data.refresh_token))
          navigate("/");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 500) {
          setAlertMessage("Please sign in with the 42 social account");
        } else if (error.response?.data?.error) {
          setAlertMessage(error.response.data.error); 
        } else {
          setAlertMessage("An error occurred. Please try again.");
        }
      } else if (error instanceof Error && error.message) {
        setAlertMessage("Credentials are not correct");
      } else {
        setAlertMessage("Unexpected error occurred. Please try again later");
      }
    }
  };

  return (
    <>
      <FormTemplate>
        {alertMessage && <Alert color="danger">{alertMessage}</Alert>}
        {
          <Form onSubmit={submitHandler}>
            <h3 className="text-center text-muted mb-2 mb-0">Sign In</h3>
            <InputFields placeholder="Email" name="email" currentValue={email} changlehandler={handleChange} />
            <InputFields
              type={formData.showPassword ? "text" : "password"}
              placeholder="password"
              name="password"
              currentValue={password}
              changlehandler={handleChange}
            >
              <Button color="primary" outline onClick={handleShowPassword}>
                {formData.showPassword ? "hide" : "show"}
              </Button>
            </InputFields>
            <Button color="primary" block>
              Submit
            </Button>
            <p className="text-center fw-bold mb-2 mt-2">OR</p>
            <SocialSignInButton
              icon={fortytwo}
              message="Sign in with"
              redirectUri={`https://api.intra.42.fr/oauth/authorize?client_id=${
                import.meta.env.VITE_CLIENT_ID_42
              }&redirect_uri=https%3A%2F%2F${import.meta.env.VITE_DOMAIN}%2F42&response_type=code`}
            />
            <Row>
              <Col xs="5">
                <Link to="/password/reset-request" className="link-underline link-underline-opacity-0">
                  <small className="text-primary">Forgot Password?</small>
                </Link>
              </Col>
              <Col className="text-end" xs="7">
                <p className="text-muted">
                  New to Transcendence?
                  <Link to="/register" className="link-underline link-underline-opacity-0">
                    <small className="text-primary"> Register here</small>
                  </Link>
                </p>
              </Col>
            </Row>
          </Form>
        }
      </FormTemplate>
    </>
  );
};

export default Login;
