import { Form, Button } from "reactstrap";
import { useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { InputFields } from "./utils"
import FormTemplate from "./FormTemplate"
import axios from "axios";

interface newPasswordProps {
  password: string;
  password2: string;
  uidb64: string;
  token: string;
}

export const PasswordReset = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<newPasswordProps>({
    password: "",
    password2: "",
    uidb64: uid ? uid : "",
    token: token ? token : "",
  });
  const { password, password2 } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`${import.meta.env.VITE_CN_URL}/api/v1/auth/set-new-password/`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status === 200) {
        navigate("/");
      }
    } catch {
      console.log("error happenned when reseting password");
    }
  };

  return (
    <FormTemplate>
      <Form onSubmit={submitHandler}>
        <InputFields placeholder="password" name="password" currentValue={password} changlehandler={handleChange} />
        <InputFields
          placeholder="Confirm password" name="password2" currentValue={password2} changlehandler={handleChange}
        />
        <Button color="primary" block>Reset</Button>
        <p className="text-center fw-bold text-muted mt-5 mb-0">OR</p>
        <p className="text-center text-muted mb-0">
          {"Go back to "}
          <Link to="/" className="fw-bold text-body">
            <u>Login</u>
          </Link>
        </p>
      </Form>
    </FormTemplate>
  );
};