import { useEffect, useState } from "react";
import { Alert, Card, CardBody, CardTitle, CardText, Button, Container } from "reactstrap";
import LocalPlayer from "./LocalPlayer.tsx";
import { styles, ScoreBoard, Timer } from "./LocalStyles.tsx";
import Ball from "./Ball.tsx";
import { getUserDetails } from "../../../apicalls/ApiFriends.ts";
import { useLoaderData } from "react-router-dom";

interface User {
  id: number;
  username: string;
}

export const loader = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user) {
    const userDetails = await getUserDetails(user.username);
    return userDetails;
  }
  return null;
};

const LocalGame = () => {
  const [roomState, setRoomState] = useState("1");
  const jwt_token = localStorage.getItem("access_token");
  const user = useLoaderData() as User;
  const [overlayMessage, setOverlayMessage] = useState("");
  const [ws, setWs] = useState<WebSocket>();
  const [ballPosition, setBallPosition] = useState({ x: "50%", y: "50%" });
  const [paddles, setPaddles] = useState({
    red: { top: "40%" },
    blue: { top: "40%" },
  });

  const [player1_score, setPlayer1_score] = useState<number>(0);
  const [player2_score, setPlayer2_score] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(1);

  const handleStartButton = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "start_game" }));
      setRoomState("2");
    }
  };

  useEffect(() => {
    const userString = user.username || "guest";
    const newWs = new WebSocket(`${import.meta.env.VITE_CN_WS_URL}/ws/localgame/${userString}/`);

    newWs.onopen = () => {
      setWs(newWs); // Set ws state here to ensure it's available after connection
    };

    newWs.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === "paddle_update") {
        setPaddles({
          red: { top: `${data.paddles.red.top}%` },
          blue: { top: `${data.paddles.blue.top}%` },
        });
      } else if (data.type === "ball_update") {
        setBallPosition({
          x: `${data.ball.x}%`,
          y: `${data.ball.y}%`,
        });
      } else if (data.type === "interval_update") {
        setPlayer1_score(data.player1_score);
        setPlayer2_score(data.player2_score);
        setMinutes(data.minutes);
        setSeconds(data.seconds);
      } else if (data.type === "overlay_update") {
        if (data.message === "MENU") {
          setOverlayMessage("!");
          setRoomState("1");
        }
        setOverlayMessage(data.message);
      }
    };

    newWs.onclose = () => {
      setWs(undefined); // Clear ws state when connection is closed
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "s", "o", "l"].includes(key) && newWs.readyState === WebSocket.OPEN) {
        newWs.send(JSON.stringify({ type: "keydown", key }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "s", "o", "l"].includes(key) && newWs.readyState === WebSocket.OPEN) {
        newWs.send(JSON.stringify({ type: "keyup", key }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.close();
      }
    };
  }, [user.username]);

  return (
    // <div className="d-flex flex-column justify-content-center h-100">
    <>
      {/* <div className="d-flex flex-column bg-secondary p-2 h-100"> */}

      {roomState === "1" && (
        <Container className="h-100 overflow-auto">
          <div className="imageContainer">
            <Button color="info" className="absoluteButton" onClick={handleStartButton}>
              Start
            </Button>
            <img src="/LocalMenu.png" alt="Squirtle playing table tennis" className="leftImage" />
          </div>
          <Card className="bg-black">
            <CardBody className="text-light">
              <CardTitle>Pong Rules:</CardTitle>
              <CardText>
                <p>The first player to 11 points, or with the most points when the time runs out wins!</p>
                <p>
                  <b className="text-danger">Red</b> player controls: W (up), S (down).
                </p>
                <p>
                  <b className="text-info">Blue</b> player controls: O (up), L (down).
                </p>
              </CardText>
            </CardBody>
          </Card>
        </Container>
      )}
      {roomState === "2" && (
        <div className="pongArea">
          <div
            className="overlay"
            style={{ visibility: overlayMessage && overlayMessage !== "!" ? "visible" : "hidden" }}
          >
            {overlayMessage}
          </div>
          <div className="middleLine"></div>
          <div className="centerCircle"></div>
          <LocalPlayer key="1" color="red" left="2" top={paddles.red.top} />
          <LocalPlayer key="2" color="blue" left="93" top={paddles.blue.top} />
          <Ball left={ballPosition.x} top={ballPosition.y} />
          <ScoreBoard leftScore={player1_score} rightScore={player2_score} />
          <Timer minutes={minutes} seconds={seconds} />
        </div>
      )}
      {/* </div> */}
    </>
  );
};

export default LocalGame;
