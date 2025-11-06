export interface Participant {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string;
}

export interface VotingRound {
  description: string;
  votes: { [userId: string]: string };
  participants: { [userId: string]: string };
  timestamp: Date;
  average: number | null;
  durationSeconds: number;
}

export interface Room {
  id: string;
  participants: Participant[];
  votesRevealed: boolean;
  votes?: { [userId: string]: string };
  currentDescription: string;
  votingHistory: VotingRound[];
  votingStartTime?: Date | null;
}

export interface User {
  id: string;
  name: string;
}

export interface RoomState {
  room: Room | null;
  currentUser: User | null;
  connected: boolean;
}

export interface CreateRoomResponse {
  success: boolean;
  roomId?: string;
  userId?: string;
  roomState?: any;
  error?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  roomId?: string;
  userId?: string;
  roomState?: any;
  error?: string;
}

export interface VoteStatistics {
  average: number | null;
  mostCommon: string | null;
  distribution: { [vote: string]: number };
}

