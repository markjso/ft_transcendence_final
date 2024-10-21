import { Form, Button, Alert, ModalHeader } from "reactstrap";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InputFields } from "./utils"
import FormTemplate from "./FormTemplate"

export const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertColour, setAlertColour] = useState("primary");

  const navigate = useNavigate();

  const submitHandler = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_CN_URL}/api/v1/auth/verify-email/`,
        { otp: otp },
        { headers: { "Content-Type": "application/json" } },
      );
      switch (response.status) {
        case 200: {
          navigate("/");
          break;
        }
        case 204: {
          setAlertMessage("you are already registered");
          setAlertColour("warning");
          break;
        }
        case 404: {
          setAlertMessage("please provide your code");
          setAlertColour("danger");
          break;
        }
      }
    } catch {
      setAlertMessage("an error happenned please look into it");
      setAlertColour("danger");
    }
  };

  return (
    <FormTemplate>
      {alertMessage ? <Alert color={alertColour}>{alertMessage}</Alert> : <></>}
      <Form onSubmit={submitHandler}>
        <ModalHeader>A code has been sent your email</ModalHeader>
        <InputFields placeholder="Enter your code" name="otp" currentValue={otp} changlehandler={(e) => setOtp(e.target.value)} />
        <Button color="primary" block>
          Verify
        </Button>
      </Form>
    </FormTemplate>
  );
};
