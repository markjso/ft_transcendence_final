import React from 'react';
import { Container, Button, ListGroup, ListGroupItem, Row, Col } from 'reactstrap';
import { PlayerDetails, TournamentDetails, UserDetails } from './interfaces';

interface PlayerListProps {
  currentuser: UserDetails;
  currentTournament?: TournamentDetails;
  players: PlayerDetails[],
  isUserInTournament: boolean;
  currentUserId: number;
  handleJoin: () => void;
  handleLeave: () => void;
  handleStart: () => void;
}

const PlayerList: React.FC<PlayerListProps> = ({
  currentuser,
  currentTournament,
  players,
  isUserInTournament,
  handleJoin,
  handleLeave,
  handleStart
}) => {
  if (!currentTournament) return null;

  return (
    <Container className="p-3">
      {(currentTournament && currentTournament.status === "upcoming") &&
        <Row className="mb-3 justify-content-center align-items-center">
          <Col xs="auto">
            <Button
              className="bi-play-fill"
              color="primary"
              onClick={handleStart}
              disabled={currentTournament.host.id !== currentuser.id}
            >
            </Button>
          </Col>

          <Col xs="auto">
            {isUserInTournament ? (
              <Button
                className="bi-person-dash"
                onClick={handleLeave}
              >
              </Button>
            ) : (
              <Button
                className="bi-person-plus"
                color="info"
                onClick={handleJoin}
              >
              </Button>
            )}
          </Col>
        </Row>
      }

      <Row className="justify-content-center">
        <Col xs="auto" style={{ width: '250px' }}>
          <ListGroup>
            {Array.from({ length: currentTournament.max_size }).map((_, index) => (
              <ListGroupItem
                key={index}
                className="d-flex justify-content-between align-items-center text-center"
              >
                <strong
                  style={{
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {players[index]?.nickname || '(empty slot)'}
                </strong>
              </ListGroupItem>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default PlayerList;
