import { ListGroup, ListGroupItem } from "reactstrap";
import AxiosInstance from "../Authentication/utils/AxiosInterceptor.ts";
import { useLoaderData } from 'react-router-dom';
import { getUserDetails } from "../../../apicalls/ApiFriends.ts";

const API_URL = `/tournament`;

interface Match {
  id: number;
  match_date: string;
  opponent: string;
  result: string;
}

export const loader = async ({params}) => {
  try {
    const user = await getUserDetails(params.username);
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
    return { loggedInUserHistory };
  } catch (error) {
    return null;
  }
};

interface Loader {
  loggedInUserHistory: [Match];
}

const MatchHistory = () => {
  const { loggedInUserHistory } = useLoaderData() as Loader;

  return (
    <div className="d-flex flex-column pt-2">
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

export default MatchHistory;