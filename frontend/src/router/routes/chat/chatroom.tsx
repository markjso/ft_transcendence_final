// ** offcanvas view for mobile add later
import { useState, useEffect, useRef } from "react";
import { Container, Input, Offcanvas, OffcanvasBody, OffcanvasHeader, Row, Col } from "reactstrap";
import useWebSocket from "react-use-websocket";
import { Message } from "./Messages.tsx";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getroom } from "../../../apicalls/ApiMessages.ts";
import Header from "./header.tsx";
import { useMediaQuery } from "react-responsive";
import type { Params } from "react-router-dom";
import { AxiosError } from "axios";

interface SenderDets {
  email: string;
  first_name: string;
  id: number;
  is_online: boolean;
  last_name: string;
  username: string;
  image_url: string;
}

interface RoomDets {
  id: number;
  name: string;
  isDirect: boolean;
  admin: string;
  users: [];
  group_name: string;
  image: string;
}

interface MessageDets {
  id: number;
  message: string;
  room: RoomDets;
  sender: SenderDets;
  timestamp: string;
}

interface LoaderDataTypes {
  messages: MessageDets[];
  room: RoomDets;
  roomID: string;
}

export async function loader({ params }: { params: Params<"roomID"> }): Promise<LoaderDataTypes> {
  try {
    const roomID = params.roomID || "";
    const roomdetails = await getroom(roomID);
    const messages: MessageDets[] = roomdetails.data.chat_messages;
    const room: RoomDets = roomdetails.data.roomDets;
    return { messages, room, roomID };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 500)
        throw new Response("", {
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      else {
        throw new Response("", {
          statusText: "an unexpected error occured try again later",
        });
      }
    }
  }
}

const ChatRoom = () => {
  const loaderdata = useLoaderData() as LoaderDataTypes;
  const fetchedMessages = loaderdata.messages;
  const fetchedRoomDets = loaderdata.room;
  const roomID = loaderdata.roomID;

  const [messages, setMessages] = useState<MessageDets[]>([]);
  const [roomDets, setRoomDets] = useState<RoomDets>(fetchedRoomDets);
  const [newMessageText, setNewMessageText] = useState<string>("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUsername: string = user?.username ?? null;
  const jwtToken = localStorage.getItem("access_token");
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const navigate = useNavigate();
  const socketUrl = `${import.meta.env.VITE_CN_WS_URL}/ws/chat/${roomID}/?token=${jwtToken}`;

  useEffect(() => {
    setMessages(fetchedMessages);
    setRoomDets(fetchedRoomDets);
  }, [fetchedMessages, fetchedRoomDets]);

  // useEffect(() => {
  //   console.log("theses are the messages");
  //   console.log(messages);
  // }, [messages]);

  const { sendJsonMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    queryParams: { token: jwtToken || "" },
    // onOpen: () => {
    //   console.log("ws connection established");
    // },
    onMessage: (e) => handleWebSocketMessage(e),
  });

  const handleWebSocketMessage = (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === "online_count") {
        setOnlineCount(data.online_count);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const sendNewMessage = () => {
    const newMessage = {
      action: "chat.message",
      room_id: roomID,
      sender_username: currentUsername,
      message: newMessageText,
      timestamp: new Date().toISOString(),
    };
    console.log(newMessage);
    try {
      sendJsonMessage(newMessage);
    } catch (e) {
      console.log("error in sendJsonmessage", e);
    }
  };

  const sendGameInvite = (username: string) => {
    const newMessage = {
      action: "chat.message",
      room_id: roomID,
      sender_username: currentUsername,
      message: `Hey ${username}, I challenge you to play a game of Pong!`,
      timestamp: new Date().toISOString(),
    };
    console.log(newMessage);
    try {
      sendJsonMessage(newMessage);
    } catch (e) {
      console.log("error in sendJsonmessage", e);
    }
  };

  const messageElements = messages.map((message, index) => {
    const hasNextMessage = index + 1 < messages.length;
    const image = hasNextMessage ? messages[index + 1].sender.username !== message.sender.username : true;
    return (
      <Message
        sendGameInvite={sendGameInvite}
        key={message.id}
        id={message.id}
        message={message}
        image={image}
        roomID={roomID}
      />
    );
  });

  const isMobile = useMediaQuery({ query: "(max-width: 576px)" });
  const isIpad = useMediaQuery({ query: "(max-width: 768px)" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessageText(e.target.value);
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendNewMessage();
      setNewMessageText("");
    }
  };

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    // ** offcanvas view for mobile
    <>
      <Offcanvas
        direction="end"
        isOpen={isMobile && roomID ? true : false}
        toggle={function noRefCheck() {
          navigate(`/chat`);
        }}
        className="bg-black d-md-none w-100"
      >
        <OffcanvasHeader className="border-bottom align-items-center text-light w-100 p-0">
          <Header className="p-2 mt-3 vw-100 h-100" online_count={onlineCount} roomDets={roomDets}></Header>
        </OffcanvasHeader>

        <OffcanvasBody>
          <ChatBody
            messageElements={messageElements}
            newMessageText={newMessageText}
            onEnter={handleEnterKey}
            handleInputChange={handleInputChange}
            messageEndRef={messageEndRef}
          />
        </OffcanvasBody>
      </Offcanvas>
      {/* // ** view for larger screens */}
      <Container className="h-100 py-1">
        <Row style={{ height: "10%" }} className="align-items-center">
          <Header
            className={"p-2 " + isIpad ? "mt-0" : "mt-3" + " w-100 h-100"}
            online_count={onlineCount}
            roomDets={roomDets}
          ></Header>
        </Row>
        <Container style={{ height: "90%" }}>
          <ChatBody
            messageElements={messageElements}
            newMessageText={newMessageText}
            onEnter={handleEnterKey}
            handleInputChange={handleInputChange}
            messageEndRef={messageEndRef}
          />
        </Container>
      </Container>
    </>
  );
};

export default ChatRoom;

interface ChatBodyProps {
  messageElements: JSX.Element[];
  onEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newMessageText: string;
  messageEndRef: React.MutableRefObject<HTMLDivElement | null>;
}

const ChatBody = (props: ChatBodyProps) => {
  return (
    <>
      <Row
        className="px-0"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "auto",
          height: "94%",
        }}
      >
        <Col>
          {props.messageElements}
          <div ref={props.messageEndRef} />
        </Col>
      </Row>
      <Row style={{ height: "5%" }}>
        <Input
          className="text-dark bg-light input-border-radius-lg"
          onKeyDown={props.onEnter}
          name="message"
          placeholder="Message..."
          onChange={props.handleInputChange}
          value={props.newMessageText}
          style={{
            outline: "none",
          }}
          maxLength={511}
        />
      </Row>
    </>
  );
};
