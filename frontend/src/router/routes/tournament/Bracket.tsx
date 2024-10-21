import React from 'react';
import Match from './Match';
import { Container, Row, Col } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

import { MatchDetails } from './interfaces';

interface BracketProps {
  matches: MatchDetails[];
}

const groupMatchesByRound = (matches: MatchDetails[]) => {
  const rounds: { [key: number]: MatchDetails[] } = {};

  matches.forEach(match => {
    if (!rounds[match.round]) {
      rounds[match.round] = [];
    }
    rounds[match.round].push(match);
  });

  return Object.keys(rounds)
    .sort((a, b) => Number(a) - Number(b))
    .map(round => rounds[Number(round)]);
};

const handleButtonClick = (match: MatchDetails, navigate: any) => {
  if (!match.player1 || !match.player2) {
    console.log("Cannot view match. Both players must be set.");
    return;
  }
  if (match.winner) {
    console.log("Match already has a winner, cannot view match.");
    return;
  }

  if (match.tournament) {
    const concatenatedMatchId = `${match.tournament.id}_${match.id}`;
    navigate(`/room/${concatenatedMatchId}`, { state: { match } });
  }
};

const Bracket: React.FC<BracketProps> = ({ matches }) => {
  const navigate = useNavigate();
  const rounds = groupMatchesByRound(matches);

  return (
    <Container fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '70vh',
        overflowX: 'auto',
        overflowY: 'auto',
      }}
    >
      <div
        className="d-flex flex-column-reverse justify-content-center align-items-center"
        style={{ width: '100%' }}
      >
        {rounds.map((roundMatches, roundIndex) => (
          <Row key={roundIndex} className="justify-content-center mb-4 w-100">
            {roundMatches.map((match, matchIndex) => {
              const isDisabled = !match.player1 || !match.player2 || !!match.winner;
              const buttonColor = isDisabled ? 'secondary' : 'info';

              return (
                <Col
                  key={match.id}
                  style={{
                    borderRadius: '10px',
                    padding: '10px',
                    maxWidth: '270px',
                    margin: '0 auto',
                  }}
                >
                  <Match
                    tournament={match.tournament}
                    matchIndex={matchIndex}
                    roundIndex={roundIndex}
                    player1={match.player1}
                    player2={match.player2}
                    winner={match.winner}
                    isDisabled={isDisabled}
                    buttonColor={buttonColor}
                    onButtonClick={() => handleButtonClick(match, navigate)}
                  />
                </Col>
              );
            })}
          </Row>
        ))}
      </div>
    </Container>
  );
};

export default Bracket;
