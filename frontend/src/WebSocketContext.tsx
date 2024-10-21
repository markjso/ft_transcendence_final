import React, { createContext, useEffect, useState, useContext } from 'react';
import { MatchDetails } from './router/routes/tournament/interfaces.ts';
import { notifyNextMatch } from './router/Toast.tsx';
import { fetchMatchById } from './router/routes/tournament/ApiTournament.ts';
import { useNavigate } from 'react-router-dom';

interface WebSocketContextType {
  loginSocket: WebSocket | null;
  setLoginSocket: (socket: WebSocket | null) => void;
  onlineUsers: { userId: number; username: string }[];
  nextMatch: MatchDetails | null;
  setNextMatch: (match: MatchDetails | null) => void;
}

// Create WebSocket context
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [loginSocket, setLoginSocket] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ userId: number; username: string }[]>([]);
  const jwt_token: string | null = localStorage.getItem('access_token');
  const [nextMatch, setNextMatch] = useState<MatchDetails | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const handleMatchNotification = async (matchId: number) => {
    const response = await fetchMatchById(matchId);

    if (response.status === 200) {
      const match: MatchDetails = await response.data;
      notifyNextMatch(match, navigate);
    } else {
      alert('Error fetching match details. Please try again later.');
    }
  };

  // Function to establish a new WebSocket connection
  const connectWebSocket = () => {
    if (!jwt_token) {
      return;
    }
    const ws = new WebSocket(`${import.meta.env.VITE_CN_WS_URL}/ws/online-status/?token=${jwt_token}`);

    ws.onopen = () => {
      setLoginSocket(ws); // Save the WebSocket instance
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'online') {
        setOnlineUsers((prev) => [...prev, { userId: data.user_id, username: data.username }]);
      } else if (data.type === 'offline') {
        setOnlineUsers((prev) => prev.filter((user) => user.userId !== data.user_id));
      } else if (data.type === 'next_match') {
        if (data.player1_id === user.id || data.player2_id === user.id) {
          handleMatchNotification(data.match_id);
        }
      }
    };

    ws.onerror = (error) => {
      ws.close(); // Close the socket on error
    };

    return ws;
  };

  useEffect(() => {
    if (jwt_token) {
      const ws = connectWebSocket(); // Initiate the WebSocket connection

      return () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close(); // Close the WebSocket if it's open
        }
        setLoginSocket(null); // Cleanup
      };
    }
  }, [jwt_token]);

  return (
    <WebSocketContext.Provider value={{ loginSocket, setLoginSocket, onlineUsers , nextMatch, setNextMatch  }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to access WebSocket context
export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
