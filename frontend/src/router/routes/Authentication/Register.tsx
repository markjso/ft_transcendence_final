import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "reactstrap";
import { useNavigate, Link } from "react-router-dom";
import { InputFields, validateEmail } from "./utils"
import FormTemplate from "./FormTemplate"

interface UserProps {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  showPassword: boolean;
}

export const Register = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserProps>({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    showPassword: false,
  });
  const { email, username, first_name, last_name, password, password2 } = formData;

  const handleShowPassword = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setAlertMessage("Email does not have correct formate");
      return ;
    }
    if (formData.password !== formData.password2) {
      setAlertMessage("passwords do not match");
      return ;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_CN_URL}/api/v1/auth/register/`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status == 201) {
        navigate("/verify");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.data) {
          if (error.response.data.email) {
            setAlertMessage(error.response?.data.email);
          }
        }
        console.error(error.response);
      }
    }
    setIsLoading(false);
  };

  return (
    <FormTemplate>
      {alertMessage ? <Alert color="danger">{alertMessage}</Alert> : <></>}
      <h3 className="text-center text-muted mb-2 mb-0">Register</h3>
      <Form onSubmit={submitHandler}>
        <InputFields placeholder="Email" name="email" currentValue={email} changlehandler={handleChange} />
        <InputFields placeholder="Username" name="username" currentValue={username} changlehandler={handleChange} />
        <InputFields
          placeholder="Firstname"
          name="first_name"
          currentValue={first_name}
          changlehandler={handleChange}
        />
        <InputFields placeholder="Lastname" name="last_name" currentValue={last_name} changlehandler={handleChange} />
        <InputFields
          type={formData.showPassword ? "text" : "password"}
          placeholder="password"
          name="password"
          currentValue={password}
          changlehandler={handleChange}
          minLength={8}
        >
          <Button color="light" className="btn btn-outline-info" onClick={handleShowPassword}>
            {formData.showPassword ? "hide" : "show"}
          </Button>
        </InputFields>
        <InputFields
          placeholder="Confirm password"
          name="password2"
          currentValue={password2}
          changlehandler={handleChange}
        />
        <Button color="primary" block disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm">Loading...</Spinner>
              <span> Loading</span>{" "}
            </>
          ) : (
            "submit"
          )}
        </Button>
        <p className="text-muted">
          Already have an account?
          <Link to="/" className="link-underline link-underline-opacity-0">
            <small className="text-primary"> Login here</small>
          </Link>
        </p>
      </Form>
    </FormTemplate>
  );
};
