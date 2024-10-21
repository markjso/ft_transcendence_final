import { NavigateFunction } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { MatchDetails } from './routes/tournament/interfaces';

export const notifySuccess = (message: string) => {
  toast.success(message);
};

export const notifyError = (message: string) => {
  toast.error(message);
};

export const notifyInfo = (message: string) => {
  toast.info(message);
};

export const notifyWarning = (message: string) => {
  toast.warn(message);
};

export const notifyGameInvite = (username: string, currentUsername: string) => {
  toast.info(`Hey ${username}, ${currentUsername} has invited you to a game!`);
};

export const notifyNextMatch = (match: MatchDetails, navigate: NavigateFunction) => {
  const handleMatchButton = () => {
    if (!match.player1 || !match.player2) {
      return;
    } else if (match.winner) {
      return;
    } else if (match.tournament) {
      const concatenatedMatchId = `${match.tournament.id}_${match.id}`;
      toast.dismiss();
      navigate(`/room/${concatenatedMatchId}`, { state: { match } });
    }
  };

  toast.info(
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "16px",
      color: "#333"
    }}>
      <div className="text-center">
        <i>Next Match</i><br />
        <strong>{match.player1?.nickname}</strong> <i>vs</i> <strong>{match.player2?.nickname}</strong>
      </div>
      <Button
        color="primary"
        style={{
          marginLeft: "15px",
          borderRadius: "6px",
          paddingTop: "10px",
          paddingBottom: "10px",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={handleMatchButton}
      >
        PONG 🏓
      </Button>
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
    }
  );
};
