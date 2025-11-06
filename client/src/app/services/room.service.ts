import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from './socket.service';
import { Room, User, Participant } from '../models/room.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private roomSubject = new BehaviorSubject<Room | null>(null);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private connectedSubject = new BehaviorSubject<boolean>(false);
  private listenersInitialized = false;

  public room$ = this.roomSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();
  public connected$ = this.connectedSubject.asObservable();

  constructor(
    private socketService: SocketService,
    private router: Router
  ) {}

  private initializeSocketListeners(): void {
    if (this.listenersInitialized) {
      return;
    }

    console.log('Initializing socket listeners...');
    this.listenersInitialized = true;

    // Listen for room updates
    this.socketService.on<any>('room-updated').subscribe({
      next: (roomState) => {
        console.log('Room updated received:', roomState);
        this.updateRoomState(roomState);
      },
      error: (error) => console.error('Error in room-updated:', error)
    });

    // Listen for user joined events
    this.socketService.on<any>('user-joined').subscribe({
      next: (data) => {
        console.log('User joined received:', data);
        this.updateRoomState(data.roomState);
      },
      error: (error) => console.error('Error in user-joined:', error)
    });

    // Listen for user left events
    this.socketService.on<any>('user-left').subscribe({
      next: (data) => {
        console.log('User left received:', data);
        this.updateRoomState(data.roomState);
      },
      error: (error) => console.error('Error in user-left:', error)
    });
  }

  private updateRoomState(roomState: any): void {
    if (!roomState) return;

    const room: Room = {
      id: roomState.id,
      participants: roomState.participants || [],
      votesRevealed: roomState.votesRevealed || false,
      votes: roomState.votes,
      currentDescription: roomState.currentDescription || '',
      votingHistory: roomState.votingHistory || [],
      votingStartTime: roomState.votingStartTime ? new Date(roomState.votingStartTime) : null
    };

    this.roomSubject.next(room);
  }

  async createRoom(userName: string): Promise<string> {
    this.socketService.connect();
    
    // Small delay to ensure socket is connected before setting up listeners
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize listeners after connection
    this.initializeSocketListeners();
    
    try {
      const response = await this.socketService.emit('create-room', { userName });
      
      if (response.success) {
        const user: User = {
          id: response.userId,
          name: userName
        };
        
        this.currentUserSubject.next(user);
        this.connectedSubject.next(true);
        this.updateRoomState(response.roomState);
        
        return response.roomId;
      } else {
        throw new Error(response.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string, userName: string): Promise<void> {
    this.socketService.connect();
    
    // Small delay to ensure socket is connected before setting up listeners
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize listeners after connection
    this.initializeSocketListeners();
    
    try {
      const response = await this.socketService.emit('join-room', { roomId, userName });
      
      if (response.success) {
        const user: User = {
          id: response.userId,
          name: userName
        };
        
        this.currentUserSubject.next(user);
        this.connectedSubject.next(true);
        this.updateRoomState(response.roomState);
      } else {
        throw new Error(response.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  async submitVote(vote: string): Promise<void> {
    const room = this.roomSubject.value;
    if (!room) {
      throw new Error('Not in a room');
    }

    try {
      await this.socketService.emit('submit-vote', { roomId: room.id, vote });
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  async revealVotes(): Promise<void> {
    const room = this.roomSubject.value;
    if (!room) {
      throw new Error('Not in a room');
    }

    try {
      await this.socketService.emit('reveal-votes', { roomId: room.id });
    } catch (error) {
      console.error('Error revealing votes:', error);
      throw error;
    }
  }

  async clearVotes(): Promise<void> {
    const room = this.roomSubject.value;
    if (!room) {
      throw new Error('Not in a room');
    }

    try {
      await this.socketService.emit('clear-votes', { roomId: room.id });
    } catch (error) {
      console.error('Error clearing votes:', error);
      throw error;
    }
  }

  async setDescription(description: string): Promise<void> {
    const room = this.roomSubject.value;
    if (!room) {
      throw new Error('Not in a room');
    }

    try {
      await this.socketService.emit('set-description', { roomId: room.id, description });
    } catch (error) {
      console.error('Error setting description:', error);
      throw error;
    }
  }

  async deleteHistoryItem(index: number): Promise<void> {
    const room = this.roomSubject.value;
    if (!room) {
      throw new Error('Not in a room');
    }

    try {
      await this.socketService.emit('delete-history', { roomId: room.id, index });
    } catch (error) {
      console.error('Error deleting history item:', error);
      throw error;
    }
  }

  leaveRoom(): void {
    const room = this.roomSubject.value;
    if (room) {
      this.socketService.emit('leave-room', { roomId: room.id }).catch(console.error);
    }
    
    this.socketService.disconnect();
    this.roomSubject.next(null);
    this.currentUserSubject.next(null);
    this.connectedSubject.next(false);
    this.listenersInitialized = false;
    
    this.router.navigate(['/']);
  }

  getCurrentRoom(): Room | null {
    return this.roomSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isConnected(): boolean {
    return this.connectedSubject.value;
  }
}

