import AxiosInstance from '../Authentication/utils/AxiosInterceptor';

const API_URL = `/tournament`;
const DAPP_URL = `/dapp`;

export const fetchTournaments = async () => {
    const response = await AxiosInstance.get(`${API_URL}/tournaments/`);
    return response.data;
  };

export const fetchTournamentById = async (tournamentId: number) => {
    const response = await AxiosInstance.get(`${API_URL}/tournament/${tournamentId}/`);
    return response.data;
};

export const fetchTournamentByStatus = async (tournamentStatus: string) => {
    const response = await AxiosInstance.get(`${API_URL}/status/${tournamentStatus}/`);
    return response.data;
};

export const fetchPlayerByTournament = async (tournamentId: number) => {
    const response = await AxiosInstance.get(`${API_URL}/tournament/${tournamentId}/players/`);
    return response.data;
};

export const createTournament = async (tournamentName: string, tournamentSize: number) => {
    const response = await AxiosInstance.post(`${API_URL}/create_tournament/`,
                    { name: tournamentName, max_size: tournamentSize });
    return response.data;
};

export const deleteTournament = async (tournamentId: number) => {
    const response = await AxiosInstance.delete(`${API_URL}/delete_tournament/${tournamentId}/`);
    return response.data;
};

export const addPlayerToTournament = async (tournamentId: number, nickName: string) => {
    const response = await AxiosInstance.post(`${API_URL}/add_player_to_tournament/`,
                    { tournament_id: tournamentId, nickname: nickName });
    return response.data;
};

export const removePlayerFromTournament = async (tournamentId: number) => {
    const response = await AxiosInstance.post(`${API_URL}/remove_player_from_tournament/`,
                    { tournament_id: tournamentId });
    return response.data;
};

export const fetchMatchesByTournament = async (tournamentId: number) => {
    const response = await AxiosInstance.get(`${API_URL}/matches/tournament/${tournamentId}/`);
    return response.data;
}

export const fetchMatchById = async (matchId: number) => {
    const response = await AxiosInstance.get(`${API_URL}/matches/match/${matchId}/`);
    return response;
};

export const createMatches = async (tournamentId: number) => {
    const response = await AxiosInstance.post(`${API_URL}/matches/create/`,
                    { tournament_id: tournamentId });
    return response.data;
};

export const submitMatchResult = async (matchId: number, winnerUsername: string) => {
    const response = await AxiosInstance.post(`${API_URL}/matches/submit/`,
                    { match_id: matchId, winner_username: winnerUsername });
    return response;
};

export const submitMatchScore = async (tournamentId: number, tournamentName: string,
                                        player1: string, score1: number, player2: string, score2: number) => {
    const response = await AxiosInstance.post(`${DAPP_URL}/add/`, {
        tournament_id: tournamentId,
        tournament_name: tournamentName,
        player1: player1,
        score1: score1,
        player2: player2,
        score2: score2
    });
    return response.data;
};

export const fetchMatchScore = async (tournamentId: number, tournamentName: string,
                                        player1: string, player2: string) => {
    const response = await AxiosInstance.get(`${DAPP_URL}/get/`, {
        params: {
            tournament_id: tournamentId,
            tournament_name: tournamentName,
            player1: player1,
            player2: player2
        }
    });
    return response.data;
};

export const advanceWinner = async (matchId: number) => {
    const response = await AxiosInstance.post(`${API_URL}/matches/advance/`,
                    { match_id: matchId });
    return response;
};

