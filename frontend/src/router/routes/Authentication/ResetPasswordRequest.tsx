import { Form, Button, Modal, ModalBody, Alert } from "reactstrap";
import { useState } from "react";
import axios, {AxiosError} from "axios";
import { useNavigate, Link } from "react-router-dom";
import { InputFields } from "./utils"
import FormTemplate from "./FormTemplate"

export const PasswordResetRequest = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [isModel, setIsModel] = useState(false);
  const [isbadRequest, setIsBadRequest] = useState<boolean>(false);

  const submitHandler = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_CN_URL}/api/v1/auth/password-reset/`,
        { email: email },
        { headers: { "Content-Type": "application/json" } },
      );
      if (response.status === 200) {
        setIsModel(true);
        setTimeout(() => {
          setIsModel(false);
          navigate("/");
        }, 3000); 
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 500)
          setIsBadRequest(true);
      }
      else
        console.log("password reset request failed");
    }
  };

  return (
    <div>
        <Modal isOpen={isModel}>
          <ModalBody>A reset link has been sent to your email</ModalBody>
        </Modal>
      <FormTemplate>
        {isbadRequest ? <Alert color="danger">you can not change password because you registered with 42 social account</Alert> : <></>}
        <Form onSubmit={submitHandler}>
          <h3 className="text-center text-muted mb-2 mb-0">Reset Password</h3>
          <InputFields placeholder="Email" name="email" currentValue={email} changlehandler={(e) => setEmail(e.target.value)} />
          <Button color="primary" block>
            Submit
          </Button>
          <p className="text-center fw-bold text-muted mt-5 mb-0">OR</p>
          <p className="text-center text-muted mb-0">
            {"Go back to "}
            <Link to="/" className="fw-bold text-body">
              <u>Login</u>
            </Link>
          </p>
        </Form>
      </FormTemplate>
    </div>
  );
};