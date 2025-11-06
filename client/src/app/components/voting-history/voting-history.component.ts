import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingRound } from '../../models/room.model';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-voting-history',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './voting-history.component.html',
  styleUrls: ['./voting-history.component.css']
})
export class VotingHistoryComponent {
  @Input() history: VotingRound[] = [];
  @Input() roomId: string = '';
  @Output() deleteHistory = new EventEmitter<number>();
  
  showDeleteConfirm = false;
  pendingDeleteIndex: number | null = null;
  
  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatAverage(avg: number | null): string {
    if (avg === null) return 'N/A';
    return avg.toFixed(1);
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  getVoteEntries(votes: { [userId: string]: string }, participants: { [userId: string]: string }): Array<{name: string, vote: string}> {
    return Object.entries(votes).map(([userId, vote]) => ({
      name: participants[userId] || 'Unknown',
      vote
    }));
  }

  onDeleteHistory(index: number): void {
    this.pendingDeleteIndex = index;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    if (this.pendingDeleteIndex !== null) {
      this.deleteHistory.emit(this.pendingDeleteIndex);
    }
    this.showDeleteConfirm = false;
    this.pendingDeleteIndex = null;
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteIndex = null;
  }

  downloadJSON(): void {
    if (this.history.length === 0) {
      alert('No voting history to download');
      return;
    }

    const data = {
      roomId: this.roomId,
      exportDate: new Date().toISOString(),
      totalRounds: this.history.length,
      rounds: this.history.map((round, index) => ({
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
    link.download = `voting-results-${this.roomId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

