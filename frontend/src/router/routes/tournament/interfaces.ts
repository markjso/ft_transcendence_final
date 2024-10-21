export interface UserDetails {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    is_online: boolean;
    email: string;
    image_url: string;
}

export interface TournamentDetails {
    id: number;
    name: string;
    max_size: number;
    current_size: number;
    status: string;
    host: UserDetails;
    has_spawned: boolean;
    winner: UserDetails;
}

export interface PlayerDetails {
    id: number;
    user: UserDetails;
    nickname: string;
}

export interface MatchDetails {
    id: number;
    tournament: TournamentDetails;
    round: number;
    player1: PlayerDetails | null;
    player2: PlayerDetails | null;
    winner: PlayerDetails | null;
    notified: boolean;
}

export interface ScoreDetails {
    tournament_id: number;
    tournament_name: string;
    player1: string;
    score1: number;
    player2: string;
    score2: number;
}
