import React, { createContext, useContext, useState, useEffect } from 'react';
import { TournamentDetails, PlayerDetails, MatchDetails, UserDetails } from './interfaces';
import { fetchPlayerByTournament, fetchMatchesByTournament } from './ApiTournament';

interface TWebSocketContextProps {
  socket: WebSocket | null;
  setSocket: (ws: WebSocket | null) => void;
  currentTournament: TournamentDetails | undefined;
  setCurrentTournament: (tournament: TournamentDetails | undefined) => void;
  matches: MatchDetails[];
  setMatches: (matches: MatchDetails[]) => void;
  players: PlayerDetails[];
  setPlayers: (players: PlayerDetails[]) => void;
  isUserInTournament: boolean;
  setIsUserInTournament: (isUserIn: boolean) => void;
}

const TWebSocketContext = createContext<TWebSocketContextProps | undefined>(undefined);

export enum TabState {
  Upcoming = 'upcoming',
  Ongoing = 'ongoing',
  Finished = 'finished'
}

export const TWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [currentTournament, setCurrentTournament] = useState<TournamentDetails>();
  const [matches, setMatches] = useState<MatchDetails[]>([]);
  const [players, setPlayers] = useState<PlayerDetails[]>([]);
  const [isUserInTournament, setIsUserInTournament] = useState(false);

  const user: UserDetails = JSON.parse(localStorage.getItem("user") || "{}");
  const jwtToken = localStorage.getItem("access_token");

  const checkUserInTournament = () => {
    const isInTournament = players.some(player => player.user.username === user.username);
    setIsUserInTournament(isInTournament);
  };

  const fetchMatches = async (tournamentId: number) => {
    const matches: MatchDetails[] = await fetchMatchesByTournament(tournamentId);
    setMatches(matches);
  };

  const fetchPlayers = async (tournamemntId: number) => {
    const data = await fetchPlayerByTournament(tournamemntId);
    setPlayers(data);
  };

  useEffect(() => {
    if (currentTournament && !socket) {
      checkUserInTournament();

      const ws = new WebSocket(`ws://localhost:8000/ws/tournament/${currentTournament.id}/?token=${jwtToken}`);
      setSocket(ws);

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        if (data.type === 'tournament.update') {
          const connectedTournamen: TournamentDetails = data.message;
          setCurrentTournament(connectedTournamen);
          fetchPlayers(connectedTournamen.id);
        } else if (data.type === 'match') {
          fetchMatches(data.message);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        setSocket(null);
      };
    }
  }, [currentTournament]);

  return (
    <TWebSocketContext.Provider value={{
      socket,
      setSocket,
      currentTournament,
      setCurrentTournament,
      matches,
      setMatches,
      players,
      setPlayers,
      isUserInTournament,
      setIsUserInTournament
    }}>
      {children}
    </TWebSocketContext.Provider>
  );
};

export const useTWebSocketContext = (): TWebSocketContextProps => {
  const context = useContext(TWebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
