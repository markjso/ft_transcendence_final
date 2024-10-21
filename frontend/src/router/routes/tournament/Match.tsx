import React, { useState, useEffect } from 'react';
import { Row, Card, CardBody, Button, Container } from 'reactstrap';
import { fetchMatchScore } from './ApiTournament';

import { TournamentDetails, PlayerDetails, ScoreDetails } from './interfaces';

interface MatchProps {
  tournament: TournamentDetails;
  matchIndex: number;
  roundIndex: number;
  player1: PlayerDetails | null;
  player2: PlayerDetails | null;
  winner: PlayerDetails | null;
  isDisabled: boolean;
  buttonColor: string;
  onButtonClick: () => void;
}

const Match: React.FC<MatchProps> = ({ tournament, matchIndex, roundIndex, player1, player2, winner, isDisabled, buttonColor, onButtonClick }) => {
  const isPlayer1Winner = player1 && winner && player1.user.id === winner.user.id;
  const isPlayer2Winner = player2 && winner && player2.user.id === winner.user.id;

  const player1Style = {
    opacity: winner === null || isPlayer1Winner ? 1 : 0.3
  };

  const player2Style = {
    opacity: winner === null || isPlayer2Winner ? 1 : 0.3
  };

  const [score, setScore] = useState<ScoreDetails>();

  const fetchScore = async () => {
    if (tournament && player1 && player2) {
      const data = await fetchMatchScore(tournament.id, tournament.name, player1.user.username, player2.user.username);
      setScore(data);
    }
  };

  useEffect(() => {
    if (isDisabled) {
      fetchScore();
    } else {
      setScore(undefined);
    }
  }, [isDisabled]);

  return (
    <Card className="mb-2">
      <CardBody>
        {/* <p>Match info: {matchIndex}_{roundIndex}</p> */}
        <Container
          className="d-flex flex-column align-items-center justify-content-center"
        >
          {/* Player 1 */}
          <div className="d-flex align-items-center">
            {player1 ? (
              <h3 style={{
                ...player1Style,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '170px'
              }}>
                {player1.nickname}
              </h3>
            ) : (
              <h3>TBD</h3>
            )}
            <h3 className='ms-2' style={player1Style}>{score ? score.score1 : ""}</h3>
          </div>

          {/* VS Text */}
          <div>
            <h5>vs</h5>
          </div>

          {/* Player 2 */}
          <div className="d-flex align-items-center">
            {player2 ? (
              <h3 style={{
                ...player2Style,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '170px'
              }}>
                {player2.nickname}
              </h3>
            ) : (
              <h3>TBD</h3>
            )}
            <h3 className='ms-2' style={player2Style}>{score ? score.score2 : ""}</h3>
          </div>
        </Container>

        {/* Button below the player details */}
        <Row className="mt-2 justify-content-center">
          <Button
            color={buttonColor}
            onClick={onButtonClick}
            disabled={isDisabled}
          >
            {isDisabled ? 'Match Not Available' : 'View Match'}
          </Button>
        </Row>
      </CardBody>
    </Card>
  );
};

export default Match;
