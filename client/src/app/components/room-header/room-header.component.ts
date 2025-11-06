import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-room-header',
  standalone: true,
  imports: [CommonModule, ThemeSwitcherComponent],
  templateUrl: './room-header.component.html',
  styleUrls: ['./room-header.component.css']
})
export class RoomHeaderComponent {
  @Input() roomId: string = '';
  @Input() userName: string = '';
  copySuccess = false;

  copyRoomId(): void {
    const roomUrl = `${window.location.origin}${window.location.pathname}#/room/${this.roomId}`;
    navigator.clipboard.writeText(roomUrl).then(() => {
      this.copySuccess = true;
      setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy room URL:', err);
    });
  }
}

