import React, { useState } from "react";
import { AxiosInstance } from "../Authentication/utils";
import { Button, Label, FormGroup, Input } from "reactstrap";
import { Form, useNavigate } from "react-router-dom";
import DefaultProfilePic from "../../../assets/icons/defaultProfilePic.png";
import { AxiosError } from "axios";

interface RoomDets {
  id: number;
  image: string;
  group_name: string;
}

const GroupImageUpdate = (props: RoomDets) => {
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    try {
      await AxiosInstance.post(`/chat/chat/GroupPicUpdate/${props.group_name}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("photo upload successful");
      navigate(".");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
        setMessage(error.response?.statusText as string);
      } else {
        setMessage("Unexpected error occured please try again later");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center p-2">
      <Form onSubmit={handleSubmit}>
        <h1 className="text-center">Update Profile</h1>
        {message && <p className="text-center text-danger">{message}</p>}
        <div>
          <div className="d-flex justify-content-center">
            <img
              className="rounded-circle overflow-hidden"
              style={{
                width: "100px",
                height: "100px",
                cursor: "pointer",
                border: "2px solid",
                borderColor: "primary",
              }}
              alt="Avatar"
              src={(newImageUrl ? newImageUrl : props.image) || DefaultProfilePic}
            />
          </div>
          <FormGroup>
            <Label for="profileFile">Change Your Avatar</Label>
            <Input
              id="profileFile"
              name="file"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </FormGroup>
          <div className="mb-3"></div>
        </div>
        <div className="mb-4"></div>

        <div className="d-flex justify-content-end">
          <Button color="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default GroupImageUpdate;
