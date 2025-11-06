import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Participant } from '../../models/room.model';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participant-list.component.html',
  styleUrls: ['./participant-list.component.css']
})
export class ParticipantListComponent {
  @Input() participants: Participant[] = [];
  @Input() currentUserId: string | null = null;
}

