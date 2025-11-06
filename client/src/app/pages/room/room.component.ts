import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoomService } from '../../services/room.service';
import { ConfigService } from '../../services/config.service';
import { Room, User } from '../../models/room.model';
import { RoomHeaderComponent } from '../../components/room-header/room-header.component';
import { ParticipantListComponent } from '../../components/participant-list/participant-list.component';
import { VotingCardComponent } from '../../components/voting-card/voting-card.component';
import { ControlPanelComponent } from '../../components/control-panel/control-panel.component';
import { ResultsDisplayComponent } from '../../components/results-display/results-display.component';
import { VotingHistoryComponent } from '../../components/voting-history/voting-history.component';
import { DonationModalComponent } from '../../components/donation-modal/donation-modal.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RoomHeaderComponent,
    ParticipantListComponent,
    VotingCardComponent,
    ControlPanelComponent,
    ResultsDisplayComponent,
    VotingHistoryComponent,
    DonationModalComponent,
    ConfirmModalComponent
  ],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
  room: Room | null = null;
  currentUser: User | null = null;
  
  readonly votingValues = ['1', '2', '3', '5', '8', '13', '20', '40', '100', '+', '?'];
  
  selectedVote: string | null = null;
  taskDescription: string = '';
  
  // Donation modal
  showDonationModal = false;
  hasVotedBefore = false;
  
  // Leave confirmation modal
  showLeaveConfirm = false;
  
  // Timer
  elapsedTime: string = '0:00';
  private timerInterval: any = null;
  
  private subscriptions = new Subscription();

  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    public configService: ConfigService
  ) {}

  ngOnInit(): void {
    // Subscribe to room updates
    this.subscriptions.add(
      this.roomService.room$.subscribe(room => {
        this.room = room;
        if (room) {
          this.taskDescription = room.currentDescription || '';
          
          // Start or update timer based on voting start time
          if (room.votingStartTime && !room.votesRevealed) {
            this.startTimer();
          } else if (room.votesRevealed && this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
          }
        }
        this.updateSelectedVote();
      })
    );

    // Subscribe to current user
    this.subscriptions.add(
      this.roomService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    const startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.elapsedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  private updateSelectedVote(): void {
    if (this.room && this.currentUser) {
      const participant = this.room.participants.find(p => p.id === this.currentUser?.id);
      this.selectedVote = participant?.vote || null;
    }
  }

  async onVoteSelected(vote: string): Promise<void> {
    if (this.room?.votesRevealed) {
      return; // Don't allow voting after reveal
    }

    // Show donation modal on first vote if enabled
    // Temporarily disabled
    // if (!this.hasVotedBefore && this.configService.showDonationModal) {
    //   this.hasVotedBefore = true;
    //   this.showDonationModal = true;
    // }

    try {
      await this.roomService.submitVote(vote);
      this.selectedVote = vote;
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
  }

  async onRevealVotes(): Promise<void> {
    try {
      await this.roomService.revealVotes();
    } catch (error) {
      console.error('Failed to reveal votes:', error);
      alert('Failed to reveal votes. Please try again.');
    }
  }

  async onClearVotes(): Promise<void> {
    try {
      await this.roomService.clearVotes();
      this.selectedVote = null;
    } catch (error) {
      console.error('Failed to clear votes:', error);
      alert('Failed to clear votes. Please try again.');
    }
  }

  onLeaveRoomClick(): void {
    this.showLeaveConfirm = true;
  }

  onConfirmLeave(): void {
    this.showLeaveConfirm = false;
    this.roomService.leaveRoom();
  }

  onCancelLeave(): void {
    this.showLeaveConfirm = false;
  }

  async onDescriptionChange(): Promise<void> {
    if (!this.room?.votesRevealed) {
      try {
        await this.roomService.setDescription(this.taskDescription);
      } catch (error) {
        console.error('Failed to update description:', error);
      }
    }
  }

  get hasVotes(): boolean {
    return this.room?.participants.some(p => p.hasVoted) || false;
  }

  get currentUserId(): string | null {
    return this.currentUser?.id || null;
  }

  onCloseDonationModal(): void {
    this.showDonationModal = false;
  }

  async onDeleteHistory(index: number): Promise<void> {
    try {
      await this.roomService.deleteHistoryItem(index);
    } catch (error) {
      console.error('Failed to delete history:', error);
      alert('Failed to delete history item.');
    }
  }

  onDownloadResults(): void {
    if (!this.room || !this.room.votingHistory || this.room.votingHistory.length === 0) {
      alert('No voting history to download');
      return;
    }

    const data = {
      roomId: this.room.id,
      exportDate: new Date().toISOString(),
      totalRounds: this.room.votingHistory.length,
      rounds: this.room.votingHistory.map((round, index) => ({
        roundNumber: index + 1,
        description: round.description,
        timestamp: round.timestamp,
        duration: `${round.durationSeconds}s`,
        average: round.average,
        votes: Object.entries(round.votes).map(([userId, vote]) => ({
          userId,
          userName: round.participants[userId] || 'Unknown',
          vote
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voting-results-${this.room.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
