import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import TourneyMatch from '../TourneyMatch/TourneyMatch.tsx';

import { MatchDetails } from './interfaces';

const MatchInstance: React.FC = () => {
  const { matchid } = useParams<{ matchid: string }>();
  const location = useLocation();
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(location.state?.match || null);
  const [loading, setLoading] = useState<boolean>(!location.state?.match);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchDetails && matchid) {
      const fetchMatchDetails = async () => {
        try {
          const response = await axios.get<MatchDetails>(`/api/matches/${matchid}`);
          setMatchDetails(response.data);
        } catch (err) {
          setError('Failed to fetch match details.');
        } finally {
          setLoading(false);
        }
      };
      fetchMatchDetails();
    }

  }, [matchid, matchDetails]);

  if (loading) return <p style={{ color: 'white' }}>Loading match details...</p>;
  if (error) return <p style={{ color: 'white' }}>{error}</p>;
  if (!matchDetails) return <p style={{ color: 'white' }}>No match details found.</p>;

  return (
    <div className='h-100'>
      {matchDetails.player1 && matchDetails.player2 ? (
        <TourneyMatch
          matchDetails={matchDetails}
        />
      ) : (
        <p style={{ color: 'white' }}>Waiting for players to be assigned...</p>
      )}
    </div>
  );
};

export default MatchInstance;
