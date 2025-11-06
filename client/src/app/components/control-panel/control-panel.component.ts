import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent {
  @Input() votesRevealed = false;
  @Input() hasVotes = false;
  @Output() revealVotes = new EventEmitter<void>();
  @Output() clearVotes = new EventEmitter<void>();
  @Output() leaveRoom = new EventEmitter<void>();

  onReveal(): void {
    this.revealVotes.emit();
  }

  onClear(): void {
    this.clearVotes.emit();
  }

  onLeave(): void {
    this.leaveRoom.emit();
  }
}

