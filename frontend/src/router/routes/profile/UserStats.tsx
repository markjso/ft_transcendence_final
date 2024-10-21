import { ListGroup, ListGroupItem } from "reactstrap";
import AxiosInstance from "../Authentication/utils/AxiosInterceptor";
import { useLoaderData } from 'react-router-dom';

const USER_URL = `/v1/auth`;
const API_URL = `/tournament`;

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
  email: string;
  image_url: string;
};

interface UserStats {
  user: UserDetails;
  games_won: number;
  games_lost: number;
  games_played: number;
  rating: number;
};

interface Match {
  id: number;
  match_date: string;
  opponent: string;
  result: string;
};

export const loader = async () => {
  try {
    const user: UserDetails = JSON.parse(localStorage.getItem("user") || "{}");

    const userstatsRes = await AxiosInstance.get(`${USER_URL}/userstats/`);
    const loggedInUserStats = userstatsRes.data.find((userData: UserStats) => userData.user.id === user.id);
    const matchesRes = await AxiosInstance.get(`${API_URL}/matches/`);
    const loggedInUserHistory: [Match] = matchesRes.data.filter((match: any) =>
      match.player1 &&
      match.player2 &&
      match.winner &&
      (match.player1.user.id === user.id || match.player2.user.id === user.id)
    )
      .map((match: any) => {
        return {
          match_date: new Date(match.match_date).toLocaleDateString('en-GB'),
          opponent: match.player1.user.id === user.id ? match.player2.user.username : match.player1.user.username,
          result: match.winner.user.id === user.id ? 'WON' : 'LOST'
        };
      });
    return { loggedInUserStats, loggedInUserHistory };
  } catch (error) {
    console.error('Failed to load UserStats data', error);
    return null;
  }
};

interface Loader {
  loggedInUserStats: UserStats;
  loggedInUserHistory: [Match];
}

const UserStats = () => {
  const { loggedInUserStats, loggedInUserHistory } = useLoaderData() as Loader;

  return (
    <div className="d-flex flex-column pt-2">
      <div>
        <div className="pt-2">
          <div style={{ padding: "10px", border: "none" }}>
            <ListGroup>
              {loggedInUserStats && (
                <>
                  <ListGroupItem style={{ backgroundColor: '#28242c', color: 'white', border: 'none' }}>
                    <h6 style={{ display: "inline" }}>Games played {loggedInUserStats.games_played}</h6>
                  </ListGroupItem>
                  <ListGroupItem style={{ backgroundColor: '#28242c', color: 'white', border: 'none' }}>
                    <h6 style={{ display: "inline" }}>Games won {loggedInUserStats.games_won}</h6>
                  </ListGroupItem>
                  <ListGroupItem style={{ backgroundColor: '#28242c', color: 'white', border: 'none' }}>
                    <h6 style={{ display: "inline" }}>Games lost {loggedInUserStats.games_lost}</h6>
                  </ListGroupItem>
                  <ListGroupItem style={{ backgroundColor: '#28242c', color: 'white', border: 'none' }}>
                    <h6 style={{ display: "inline" }}>Rating {loggedInUserStats.rating}</h6>
                  </ListGroupItem>
                </>
              )}
            </ListGroup>
          </div>
        </div>
      </div>
      <div className="pt-3">
        <h4>Match History</h4>
        <div className="pt-2">
          <ListGroup>
            {loggedInUserHistory && loggedInUserHistory.length > 0 ? (
              loggedInUserHistory.map((match) => (
                <ListGroupItem key={match.id} style={{ backgroundColor: '#28242c', color: 'white', border: 'none' }}>
                  <h6 style={{ display: 'inline' }}>{match.match_date} vs {match.opponent} {match.result}</h6>
                </ListGroupItem>
              ))
            ) : (
              <ListGroupItem>No history found</ListGroupItem>
            )}
          </ListGroup>
        </div>
      </div>
    </div>
  );
};

export default UserStats;