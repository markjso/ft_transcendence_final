import React, { useState } from "react";
import AxiosInstance from "../Authentication/utils/AxiosInterceptor";
import { Button, Label, FormGroup, Input, Col, Modal, ModalHeader } from "reactstrap";
import { Form, useNavigate } from "react-router-dom";
import { UserDetails } from "../tournament/interfaces";

interface EditProfileProps {
  isOpen: boolean;
  toggle: () => void;
  userDets: UserDetails;
  onProfileUpdate: () => void;
  onNicknameUpdate: (newNickname: string) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ userDets, isOpen, toggle, onProfileUpdate, onNicknameUpdate }) => {
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState<string | null>(null);
  const navigate = useNavigate();

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

    if (!file && !nickname) {
      setMessage("Please select a file or enter a nickname");
      return;
    }

    if (nickname && nickname.length > 15) {
      setMessage("Nickname must be less than 15 characters");
      return;
    }

    const formData = new FormData();
    if (file) {
    formData.append("image_url", file);
    }
    if (nickname) {
      formData.append("nickname", nickname);
    }

    if (file) {
    AxiosInstance.post("v1/auth/profile/pic/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
        if (response.status < 500) {
          toggle();
          navigate("/profile");
          setMessage("Profile picture successfully updated");
          onProfileUpdate();
        }
      })
      .catch((error) => {
        setMessage("Error uploading file");
  })
}

  if (nickname) {
    AxiosInstance.post("v1/auth/update-nickname/", { nickname })
    .then((response) => {
      if (response.status < 500) {
        setMessage("Nickname updated successfully");
        onNicknameUpdate(nickname);
      }
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
      } else {
        console.log('Error', error.message);
      }
      setMessage("Error updating nickname");
    });
  }
};

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Your Details</ModalHeader>
      <div className="d-flex justify-content-center p-2">
        <Form onSubmit={handleSubmit}>
          <h1 className="text-center">Update Profile</h1>
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
                src={newImageUrl ? newImageUrl : userDets.image_url}
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
            <div className="mb-4"></div>
            <FormGroup row>
              <Label
                for="nickname">
                Enter Your Tournament Name
              </Label>
              <Col sm={8}>
                <Input
                  id="user"
                  name="user"
                  placeholder="default nickname is your username"
                  value={nickname || ''}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </Col>
            </FormGroup>
            <div className="mb-3"></div>
          </div>
          <div className="mb-4"></div>
          <div className="d-flex justify-content-end">
            <Button color="primary" type="submit">
              Submit
            </Button>
            <Button color="secondary" type="button" onClick={toggle}>
              Cancel
            </Button>
          </div>
          <h5>{message}</h5>
        </Form>
      </div>
    </Modal>
  );
};

export default EditProfile;
