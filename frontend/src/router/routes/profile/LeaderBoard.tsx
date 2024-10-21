import React from "react";
import { Table } from "reactstrap";
import { AxiosInstance } from "../Authentication/utils";
import { useLoaderData } from 'react-router-dom';

const USER_URL = `/v1/auth`;

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
  email: string;
  image_url: string;
}

interface UserStats {
  user: UserDetails;
  games_won: number;
  games_played: number;
}

export const loader = async () => {
  const response = await AxiosInstance.get(`${USER_URL}/userstats/`);
  const results: [UserStats] = response.data;
  return { results };
};

interface Loader {
  results: [UserStats];
}

const Leaderboard: React.FC = () => {
  const { results } = useLoaderData() as Loader;

  const sortedResults = [...results].sort((a, b) => {
    const WinPercentageA = (a.games_won / a.games_played) * 100;
    const WinPercentageB = (b.games_won / b.games_played) * 100;
    return WinPercentageB - WinPercentageA;
  });

  const listItems = sortedResults.map((result: UserStats, index: number) => {
    const winPercentage: number = (result.games_won / result.games_played) * 100;
    return (
      <tr key={result.user.id}>
        <th scope="row">{index + 1}</th>
        <td>{result.user.username}</td>
        <td>{result.games_played}</td>
        <td>{result.games_won}</td>
        <td>{winPercentage.toFixed(1)}%</td>
      </tr>
    );
  });

  return (
    <Table responsive hover borderless dark>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Username</th>
          <th>Played</th>
          <th>Wins</th>
          <th>Win Rate</th>
        </tr>
      </thead>
      <tbody>{listItems}</tbody>
    </Table>
  );
};

export default Leaderboard;
