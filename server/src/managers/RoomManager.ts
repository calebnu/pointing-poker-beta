import { v4 as uuidv4 } from 'uuid';
import { Room, Participant, RoomState, ParticipantData } from '../types';

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Room>;

  private constructor() {
    this.rooms = new Map();
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  /**
   * Generate a unique 6-character alphanumeric room ID
   */
  private generateRoomId(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId: string;
    
    do {
      roomId = '';
      for (let i = 0; i < 6; i++) {
        roomId += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (this.rooms.has(roomId));
    
    return roomId;
  }

  /**
   * Create a new room
   */
  public createRoom(): string {
    const roomId = this.generateRoomId();
    const room: Room = {
      id: roomId,
      participants: new Map(),
      votes: new Map(),
      votesRevealed: false,
      currentDescription: '',
      votingHistory: [],
      createdAt: new Date(),
      votingStartTime: null
    };
    
    this.rooms.set(roomId, room);
    console.log(`Room created: ${roomId}`);
    return roomId;
  }

  /**
   * Create a room with a specific ID
   */
  public createRoomWithId(roomId: string): void {
    if (this.rooms.has(roomId)) {
      console.log(`Room ${roomId} already exists`);
      return;
    }

    const room: Room = {
      id: roomId,
      participants: new Map(),
      votes: new Map(),
      votesRevealed: false,
      currentDescription: '',
      votingHistory: [],
      createdAt: new Date(),
      votingStartTime: null
    };
    
    this.rooms.set(roomId, room);
    console.log(`Room created with specific ID: ${roomId}`);
  }

  /**
   * Check if a room exists
   */
  public roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Add a participant to a room
   */
  public joinRoom(roomId: string, userId: string, userName: string): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const participant: Participant = {
      id: userId,
      name: userName,
      hasVoted: false,
      connectedAt: new Date()
    };

    room.participants.set(userId, participant);
    
    // Start timer when first participant joins
    if (room.participants.size === 1 && room.votingStartTime === null) {
      room.votingStartTime = new Date();
      console.log(`Timer started for room ${roomId}`);
    }
    
    console.log(`User ${userName} (${userId}) joined room ${roomId}`);
  }

  /**
   * Remove a participant from a room
   * Deletes the room if it becomes empty
   */
  public leaveRoom(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return;
    }

    const participant = room.participants.get(userId);
    room.participants.delete(userId);
    room.votes.delete(userId);
    
    console.log(`User ${participant?.name || userId} left room ${roomId}`);

    // Delete room if empty
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }

  /**
   * Submit a vote for a participant
   */
  public submitVote(roomId: string, userId: string, vote: string): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const participant = room.participants.get(userId);
    if (!participant) {
      throw new Error(`User ${userId} is not in room ${roomId}`);
    }

    room.votes.set(userId, vote);
    participant.hasVoted = true;
    participant.vote = vote;
    
    console.log(`User ${participant.name} voted in room ${roomId}`);
  }

  /**
   * Reveal all votes in a room
   */
  public revealVotes(roomId: string): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.votesRevealed = true;
    console.log(`Votes revealed in room ${roomId}`);
  }

  /**
   * Clear all votes in a room and save to history if revealed
   */
  public clearVotes(roomId: string): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    // Save to history if votes were revealed
    if (room.votesRevealed && room.votes.size > 0) {
      const votes: { [userId: string]: string } = {};
      const participants: { [userId: string]: string } = {};
      const numericVotes: number[] = [];
      const timestamp = new Date();

      // Calculate duration
      let durationSeconds = 0;
      if (room.votingStartTime) {
        durationSeconds = Math.floor((timestamp.getTime() - room.votingStartTime.getTime()) / 1000);
      }

      room.votes.forEach((vote, userId) => {
        votes[userId] = vote;
        const participant = room.participants.get(userId);
        if (participant) {
          participants[userId] = participant.name;
          
          // Calculate average (exclude non-numeric)
          const numValue = parseFloat(vote);
          if (!isNaN(numValue)) {
            numericVotes.push(numValue);
          }
        }
      });

      const average = numericVotes.length > 0
        ? numericVotes.reduce((sum, val) => sum + val, 0) / numericVotes.length
        : null;

      // Use description or generate one from timestamp
      const description = room.currentDescription.trim() 
        ? room.currentDescription 
        : timestamp.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });

      room.votingHistory.push({
        description,
        votes,
        participants,
        timestamp,
        average,
        durationSeconds
      });

      console.log(`Saved voting round to history: ${description} (${durationSeconds}s)`);
    }

    room.votes.clear();
    room.votesRevealed = false;
    room.currentDescription = '';
    room.votingStartTime = room.participants.size > 0 ? new Date() : null; // Reset timer for next round
    
    // Reset all participants' vote status
    room.participants.forEach(participant => {
      participant.hasVoted = false;
      participant.vote = undefined;
    });
    
    console.log(`Votes cleared in room ${roomId}`);
  }

  /**
   * Get room data
   */
  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Set the current task description
   */
  public setDescription(roomId: string, description: string): void {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    room.currentDescription = description;
    console.log(`Description set in room ${roomId}: ${description}`);
  }

  /**
   * Get sanitized room state for a specific user
   * Hides vote values if votes are not revealed
   */
  public getRoomState(roomId: string, forUserId?: string): RoomState {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} does not exist`);
    }

    const participants: ParticipantData[] = Array.from(room.participants.values()).map(p => ({
      id: p.id,
      name: p.name,
      hasVoted: p.hasVoted,
      vote: room.votesRevealed ? p.vote : undefined
    }));

    const roomState: RoomState = {
      id: room.id,
      participants,
      votesRevealed: room.votesRevealed,
      currentDescription: room.currentDescription,
      votingHistory: room.votingHistory,
      votingStartTime: room.votingStartTime
    };

    // Include votes only if revealed
    if (room.votesRevealed) {
      roomState.votes = Object.fromEntries(room.votes);
    }

    return roomState;
  }

  /**
   * Check if a room exists
   */
  public roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Get all rooms (for debugging)
   */
  public getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}

