import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label } from 'reactstrap';
import { fetchPlayerByTournament, createMatches, fetchMatchesByTournament, fetchTournamentByStatus, addPlayerToTournament, deleteTournament } from './ApiTournament.ts';
import TournamentList from './TournamentList.tsx';
import Bracket from './Bracket.tsx';
import { getUserDetails } from '../../../apicalls/ApiFriends.ts';
import { useLocation, useLoaderData } from 'react-router-dom';
import { useWebSocketContext } from '../../../WebSocketContext.tsx';
import { UserDetails, TournamentDetails, PlayerDetails, MatchDetails } from './interfaces';

export enum TabState {
  Upcoming = 'upcoming',
  Ongoing = 'ongoing',
  Finished = 'finished'
}

export const loader = async () => {
  const user: UserDetails = JSON.parse(localStorage.getItem("user") || "{}");
  const jwtToken = localStorage.getItem("access_token");
  const tournaments = await fetchTournamentByStatus(TabState.Upcoming);
  const data = await getUserDetails(user.username);
  const defaultNickname = data.nickname;

  return { user, jwtToken, tournaments, defaultNickname };
};

interface LoaderData {
  user: UserDetails;
  jwtToken: string;
  tournaments: [TournamentDetails];
  defaultNickname: string;
};

const Tournament: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab =
    queryParams.get('tab') === 'ongoing' ? TabState.Ongoing :
    queryParams.get('tab') === 'finished' ? TabState.Finished : TabState.Upcoming;
  const [currentTab, setCurrentTab] = useState<TabState>(initialTab);

  const { user, jwtToken, tournaments: initialTournaments, defaultNickname } = useLoaderData() as LoaderData;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { loginSocket } = useWebSocketContext();

  const [tournaments, setTournaments] = useState<[TournamentDetails]>(initialTournaments);
  const [selectedTournament, setSelectedTournament] = useState<TournamentDetails>();
  const [currentTournament, setCurrentTournament] = useState<TournamentDetails>();
  const [players, setPlayers] = useState<PlayerDetails[]>([]);
  const [matches, setMatches] = useState<MatchDetails[]>([]);
  const [isUserInTournament, setIsUserInTournament] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentUserId: number = user?.id ?? null;

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.length > 15) {
      setErrorMessage('Nickname cannot exceed 15 characters.');
    } else {
      setErrorMessage(null);
      setNickname(value);
    }
  };

  useEffect(() => {
    if (!jwtToken && !user) navigate("/");
  }, [jwtToken, user]);

  useEffect(() => {
    checkUserInTournament();
  }, [players])

  useEffect(() => {
    if (selectedTournament) {
      checkUserInTournament();
      setCurrentTournament(selectedTournament);

      const ws = new WebSocket(`${import.meta.env.VITE_CN_WS_URL}/ws/tournament/${selectedTournament.id}/?token=${jwtToken}`);
      setSocket(ws);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'tournament.update') {
          const connectedTournamen: TournamentDetails = data.message;
          setCurrentTournament(connectedTournamen);
          fetchPlayers(connectedTournamen.id);
          fetchData();
        } else if (data.type === 'match') {
          fetchMatches(data.message);
        }
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        setSocket(null);
      };
    }
  }, [selectedTournament]);

  useEffect(() => {
    fetchData();
    const tabQuery = currentTab === TabState.Ongoing ? 'ongoing' :
                     currentTab === TabState.Finished ? 'finished' : 'upcoming';

    navigate(`?tab=${tabQuery}`, { replace: true });
  }, [currentTab]);

  const fetchData = async () => {
    const data = await fetchTournamentByStatus(currentTab);
    setTournaments(data);
  };

  const fetchMatches = async (tournamentId: number) => {
    const matches: MatchDetails[] = await fetchMatchesByTournament(tournamentId);
    setMatches(matches);
  };

  const fetchPlayers = async (tournamemntId: number) => {
    const data = await fetchPlayerByTournament(tournamemntId);
    setPlayers(data);
  };

  const checkUserInTournament = () => {
    const isInTournament = players.some(player => player.user.username === user.username);
    setIsUserInTournament(isInTournament);
  };

  const showPlayerList = async (tournamentId: number) => {
    if (tournamentId) {
      fetchData();
      const selectedTournament = tournaments.find(t => t.id === tournamentId);
      setSelectedTournament(selectedTournament);
      await fetchMatches(tournamentId);
      await fetchPlayers(tournamentId);
      checkUserInTournament();
    }
  };

  const handleSubmitNickname = async () => {
    const finalNickname = nickname || defaultNickname;
    if (finalNickname.trim() === '') {
      setErrorMessage('Please enter a valid nickname');
      return;
    }

    try {
      if (currentTournament) {
        await addPlayerToTournament(currentTournament.id, finalNickname);
        await fetchData();
        setNickname('');
        toggleModal();
        setIsUserInTournament(true);
        if (socket)
          socket.send(JSON.stringify({ action: 'join' }));
      } else {
        alert('Error: Missing tournament or user information');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 405) {
        setErrorMessage('Nickname already exists. Please choose a different name.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleJoin = async () => {
    if (currentTournament && currentTournament.max_size === currentTournament.current_size) {
      alert('Tournament is full');
    } else {
      toggleModal();
    }
  };

  const handleLeave = async () => {
    if (matches.length > 0) {
      alert('Tournament has already started');
    } else if (socket) {
      setIsUserInTournament(false);
      socket.send(JSON.stringify({ action: 'leave', username: user.username }));
    }
  };

  const handleDelete = async (tournamentId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this tournament?\nThis action cannot be undone.");
    if (confirmed) {
      if (socket) {
        socket.close();
      }
      await deleteTournament(tournamentId);
      setCurrentTournament(undefined);
      fetchData();
      setMatches([]);
    }
  };

  const handleStart = async () => {
    if (matches.length > 0) {
      alert('Tournament has already started');
    } else if (currentTournament) {
      const count = currentTournament.max_size - currentTournament.current_size;
      if (count === 0) {
        await createMatches(currentTournament.id);
        if (socket)
          socket.send(JSON.stringify({ action: 'match', tournament_id: currentTournament.id }));

        // match notification
        const data: MatchDetails[] = await fetchMatchesByTournament(currentTournament.id);
        if (data.length === 0 || !currentTournament || currentTournament.status === "finished") return;

        const nextMatches: MatchDetails[] = data.filter((match) =>
          match.player1 !== null &&
          match.player2 !== null &&
          match.winner === null
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
                  tournament_id: currentTournament.id,
                  match_id: matchId,
                  player1_id: p1Id,
                  player2_id: p2Id,
                })
              );
            }
          }
        }
      } else if (count === 1) {
        alert('1 more player needed');
      } else {
        alert(`${count} more players needed`);
      }
    }
  };

  return (
    <Container fluid className="mt-5">
      <Row
        className="mb-3"
      >
        <Col
          className='me-3 ms-2'
          style={{
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            maxHeight: '90vh',
            width: '320px',
            maxWidth: '320px',
            height: 'auto',
            padding: '10px',
            overflowY: 'auto',
          }}
        >
          <TournamentList
            currentuser={user}
            tournaments={tournaments}
            currentTab={currentTab}
            currentUserId={currentUserId}
            players={players}
            isUserInTournament={isUserInTournament}
            setCurrentTab={setCurrentTab}
            fetchData={fetchData}
            showPlayerList={showPlayerList}
            handleJoin={handleJoin}
            handleLeave={handleLeave}
            handleDelete={handleDelete}
            handlestart={handleStart}
          />
        </Col>

        <Col
          className='me-2'
          style={{
            minHeight: "90vh",
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            padding: '10px',
          }}
        >
          {currentTournament && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h2>{currentTournament.name}</h2>
              {(currentTournament.status === 'finished' && currentTournament.winner) &&
                <h2>🏆 {currentTournament.winner.username} 🏆</h2>}
            </div>
          )}

          {matches.length > 0 ? (
            <Bracket
              matches={matches}
            />
          ) : (
            <div style={{ marginTop: '3rem', paddingTop: '3rem', textAlign: 'center', color: '#ccc' }}>
              <p>No matches available</p>
            </div>
          )}
        </Col>
      </Row>

      {/* Nickname Modal */}
      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Enter a Nickname</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="nickname">Nickname</Label>
            <Input
              type="text"
              id="nickname"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="Leave empty to use default nickname"
            />
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmitNickname}>Submit</Button>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default Tournament;
