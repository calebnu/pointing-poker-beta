import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userName = '';
  roomId = '';
  isProcessing = false;
  error = '';
  
  // Animated voting numbers for background
  animatedVotes: Array<{ value: string; left: number; animationDelay: number; duration: number }> = [];
  private readonly voteValues = ['1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];

  constructor(
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  private generateAnimatedVotes(): void {
    // Generate 20 floating vote numbers
    for (let i = 0; i < 20; i++) {
      this.animatedVotes.push({
        value: this.voteValues[Math.floor(Math.random() * this.voteValues.length)],
        left: Math.random() * 100, // Random horizontal position (0-100%)
        animationDelay: Math.random() * 10, // Random start time (0-10s)
        duration: 10 + Math.random() * 10 // Random duration (10-20s)
      });
    }
  }

  ngOnInit(): void {
    // Generate animated votes for background
    this.generateAnimatedVotes();
    
    // Check if there's a room ID in the query params or session storage
    this.route.queryParams.subscribe(params => {
      const roomId = params['room'] || sessionStorage.getItem('pendingRoomId');
      if (roomId && roomId.length === 6) {
        this.roomId = roomId.toUpperCase();
        sessionStorage.removeItem('pendingRoomId');
        // Clear the query param from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  async onJoinOrCreate(): Promise<void> {
    if (!this.userName.trim()) {
      this.error = 'Please enter your name';
      return;
    }

    this.isProcessing = true;
    this.error = '';

    try {
      if (this.roomId.trim()) {
        // Join existing or create with specific ID
        const roomIdUpper = this.roomId.trim().toUpperCase();
        if (roomIdUpper.length !== 6) {
          this.error = 'Room ID must be 6 characters';
          this.isProcessing = false;
          return;
        }
        await this.roomService.joinRoom(roomIdUpper, this.userName.trim());
        this.router.navigate(['/room', roomIdUpper]);
      } else {
        // Create new room with auto-generated ID
        const newRoomId = await this.roomService.createRoom(this.userName.trim());
        this.router.navigate(['/room', newRoomId]);
      }
    } catch (error: any) {
      console.error('Failed to join/create room:', error);
      this.error = error.message || 'Failed to join/create room';
    } finally {
      this.isProcessing = false;
    }
  }
}
