export interface Participant {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string;
  connectedAt: Date;
}

export interface VotingRound {
  description: string;
  votes: { [userId: string]: string };
  participants: { [userId: string]: string }; // userId -> userName
  timestamp: Date;
  average: number | null;
  durationSeconds: number;
}

export interface Room {
  id: string;
  participants: Map<string, Participant>;
  votes: Map<string, string>;
  votesRevealed: boolean;
  currentDescription: string;
  votingHistory: VotingRound[];
  createdAt: Date;
  votingStartTime: Date | null;
}

export interface RoomState {
  id: string;
  participants: ParticipantData[];
  votesRevealed: boolean;
  votes?: { [userId: string]: string };
  currentDescription: string;
  votingHistory: VotingRound[];
  votingStartTime?: Date | null;
}

export interface ParticipantData {
  id: string;
  name: string;
  hasVoted: boolean;
  vote?: string;
}

export interface CreateRoomResponse {
  roomId: string;
  userId: string;
}

export interface JoinRoomResponse {
  success: boolean;
  roomState: RoomState;
}

export interface ErrorResponse {
  error: string;
}

