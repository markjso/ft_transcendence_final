import React, { useEffect, useState } from "react";
import { Alert, Card, CardBody, CardTitle, CardText, Button, Container } from "reactstrap";
import TourneyPlayer from "./TourneyMatchPlayer";
import { ScoreBoard, Timer } from "./TourneyMatchStyles";
import Ball from "./Ball";
import {
  fetchMatchesByTournament,
  advanceWinner,
  submitMatchScore,
  submitMatchResult,
  fetchTournamentById,
} from "../tournament/ApiTournament";
import { useNavigate } from "react-router-dom";
import { TournamentDetails, MatchDetails } from "../tournament/interfaces";
import { useWebSocketContext } from "../../../WebSocketContext";
import { TabState } from "../tournament/Tournament";

interface TourneyMatchProps {
  matchDetails: MatchDetails;
}

const TourneyMatch: React.FC<TourneyMatchProps> = ({ matchDetails }) => {
  const [roomState, setRoomState] = useState("1");
  const navigate = useNavigate();
  const jwtToken = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [overlayMessage, setOverlayMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [ballPosition, setBallPosition] = useState({ x: "50%", y: "50%" });
  const [paddles, setPaddles] = useState({
    red: { top: "45%" },
    blue: { top: "45%" },
  });
  const [p1Connected, setP1Connected] = useState<boolean>(false);
  const [p2Connected, setP2Connected] = useState<boolean>(false);
  const [player1_score, setPlayer1_score] = useState(0);
  const [player2_score, setPlayer2_score] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(1);
  const [winner, setWinner] = useState(matchDetails.winner ? matchDetails.winner.user.username : "TBD");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertColor, setAlertColor] = useState<string>("success");

  const { loginSocket } = useWebSocketContext();

  const handleStartButton = () => {
    if (winner !== "TBD") {
      setAlertMessage(`${user.nickname}: You cannot start the game.. Game has resolved!`);
      setAlertColor("warning");
    } else if (user.id !== matchDetails.player1?.user.id && user.id !== matchDetails.player2?.user.id) {
      setAlertMessage(`${user.nickname}: You cannot start the game.. you are not a player!`);
      setAlertColor("danger");
    } else if (p1Connected && p2Connected) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "start_game" }));
        setRoomState("2");
      }
    } else {
      setAlertMessage("Cannot start the game.. Both expected players are not connected!");
      setAlertColor("danger");
    }
  };

  const handleBackButton = async () => {
    const updatedTournament: TournamentDetails = await fetchTournamentById(matchDetails.tournament.id);
    if (updatedTournament.status === TabState.Ongoing) navigate("/tournament?tab=ongoing");
    else if (updatedTournament.status === TabState.Finished) navigate("/tournament?tab=finished");
    else navigate("/tournament?tab=upcoming");
  };

  const notifyNextMatch = async (tournamentId: number, tournament: TournamentDetails) => {
    const matches: MatchDetails[] = await fetchMatchesByTournament(tournamentId);

    if (matches.length === 0 || !tournament || tournament.status === TabState.Finished) return;

    const nextMatches: MatchDetails[] = matches.filter(
      (match) => match.player1 !== null && match.player2 !== null && match.winner === null
    );

    for (const nextMatch of nextMatches) {
      if (!nextMatch || nextMatch.notified) return;

      if (nextMatch.player1 && nextMatch.player2) {
        const matchId = nextMatch.id;
        const p1Id = nextMatch.player1.user.id;
        const p2Id = nextMatch.player2.user.id;

        if (loginSocket) {
          loginSocket.send(
            JSON.stringify({
              action: "next_match",
              tournament_id: tournamentId,
              match_id: matchId,
              player1_id: p1Id,
              player2_id: p2Id,
            })
          );
        }
      }
    }
  };

  useEffect(() => {
    if (!jwtToken || !user) return;

    const roomName = matchDetails?.id ? `${matchDetails.tournament.id}_${matchDetails.id}` : "default_room";
    const newWs = new WebSocket(`${import.meta.env.VITE_CN_WS_URL}/ws/match/${roomName}/`);

    newWs.onopen = () => {
      if (matchDetails.player1 && matchDetails.player2) {
        if (jwtToken) {
          newWs.send(
            JSON.stringify({
              type: "authenticate",
              token: jwtToken,
              user: user,
              player1_username: matchDetails.player1.user.username,
              player2_username: matchDetails.player2.user.username,
            })
          );
        }
        setWs(newWs);
      }
    };

    newWs.onmessage = (message) => {
      if (matchDetails.tournament && matchDetails.player1 && matchDetails.player2) {
        const data = JSON.parse(message.data);
        if (data.type === "game_state_update") {
          setBallPosition({
            x: `${data.ball.x}%`,
            y: `${data.ball.y}%`,
          });
          setPaddles({
            red: { top: `${data.paddles.red.top}%` },
            blue: { top: `${data.paddles.blue.top}%` },
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
          } else {
            setOverlayMessage(data.message);
          }
        } else if (data.type === "roomstate_update") {
          setRoomState(data.roomState);
        } else if (data.type === "state_update") {
          setP1Connected(data.p1_is_connected);
          setP2Connected(data.p2_is_connected);
          console.log("Connected players:", data.playerNames);
        } else if (data.type === "game_spectator_sync") {
          console.log("SPECTATOR SYNC: RECEIVED:" + data.roomState);
          if (data.roomState === "MENU") {
            setOverlayMessage("!");
            setRoomState("1");
          } else {
            setRoomState("2");
          }
        } else if (data.type === "game_over_update") {
          if (data.winner === matchDetails.player1.user.username)
            setOverlayMessage(`Game Over: ${matchDetails.player1.nickname} wins!`);
          else if (data.winner === matchDetails.player2.user.username)
            setOverlayMessage(`Game Over: ${matchDetails.player2.nickname} wins!`);
          else if (
            data.winner !== matchDetails.player1.user.username &&
            data.winner !== matchDetails.player2.user.username
          ) {
            setOverlayMessage(`${data.message}`);
            return;
          }
          setWinner(data.winner);

          if (user.username === data.winner) {
            submitMatchScore(
              matchDetails.tournament.id,
              matchDetails.tournament.name,
              matchDetails.player1.user.username,
              data.score1,
              matchDetails.player2.user.username,
              data.score2
            );

            submitMatchResult(matchDetails.id, data.winner)
              .then((response) => {
                if (response.status === 200) {
                  return advanceWinner(matchDetails.id);
                } else {
                  console.error("Failed to submit match result, status:", response.status);
                }
              })
              .catch((error) => {
                console.error("Error submitting match result:", error);
              })
              .then(() => {
                notifyNextMatch(matchDetails.tournament.id, matchDetails.tournament);
              })
              .catch((error) => {
                console.error("Error processing match result:", error);
              });
          }
        }
      }
    };

    newWs.onclose = () => {
      setWs(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "s", "o", "l", "Shift"].includes(key) && newWs.readyState === WebSocket.OPEN) {
        newWs.send(JSON.stringify({ type: "keydown", key }));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "s", "o", "l", "Shift"].includes(key) && newWs.readyState === WebSocket.OPEN) {
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
      setWs(null);
    };
  }, [jwtToken, user.username, matchDetails]);

  useEffect(() => {
    if (matchDetails && matchDetails.player1 && matchDetails.player2) {
      if (user.username === matchDetails.player1.user.username) {
        setAlertMessage(`${matchDetails.player1.nickname}: You have been assigned the red player.`);
        setAlertColor("danger");
      } else if (user.username === matchDetails.player2.user.username) {
        setAlertMessage(`${matchDetails.player2.nickname}: You have been assigned the blue player.`);
        setAlertColor("primary");
      } else {
        setAlertMessage(`${user.username}: You are a spectator.`);
        setAlertColor("success");
      }
    }
  }, [matchDetails, user.username]);

  return (
    <>
      {/* Alert for player role assignment */}
      {alertMessage && <Alert color={alertColor}>{alertMessage}</Alert>}

      {roomState === "1" && (
        <Container className="h-100 overflow-auto">
          <div className="imageContainer">
            {winner === "TBD" ? (
              <Button color="info" className="absoluteButton" onClick={handleStartButton}>
                Start
              </Button>
            ) : (
              <Button color="warning" className="absoluteButton" onClick={handleBackButton}>
                Back
              </Button>
            )}
            <p style={{ position: "absolute", alignItems: "center", color: "yellow", top: "95%" }}>
                  <strong>
                    FIXTURE: {matchDetails.player1?.nickname} VS. {matchDetails.player2?.nickname}
                  </strong>
                </p>
            <img src="/TourneyMenu.png" alt="Squirtle playing table tennis" className="leftImage" />
          </div>
          <Card className="bg-black">
            <CardBody className="text-light">
              <CardTitle>Pong Rules:</CardTitle>
              <CardText>
                The first player to 11 points, or with the most points when the time runs out wins!
                <br />
                As this is a tournament game, the game will reset in the case of a draw! THERE MUST BE A WINNER! <br />
                Both player controls: W (up), S (down).
                <br />
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
          <TourneyPlayer key="1" color="red" left="2" top={paddles.red.top} />
          <TourneyPlayer key="2" color="blue" left="93" top={paddles.blue.top} />
          <Ball left={ballPosition.x} top={ballPosition.y} />
          <ScoreBoard leftScore={player1_score} rightScore={player2_score} />
          <Timer minutes={minutes} seconds={seconds} />
        </div>
      )}
    </>
  );
};

export default TourneyMatch;