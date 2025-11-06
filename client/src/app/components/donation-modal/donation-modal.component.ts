import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-donation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donation-modal.component.html',
  styleUrls: ['./donation-modal.component.css']
})
export class DonationModalComponent {
  @Output() close = new EventEmitter<void>();

  onPayPal(): void {
    window.open('https://paypal.me/yourcustomlink', '_blank');
    this.close.emit();
  }

  onContactCreator(): void {
    window.location.href = 'mailto:your-email@example.com';
    this.close.emit();
  }

  onAlreadyDonated(): void {
    this.close.emit();
  }

  onDontWantToDonate(): void {
    this.close.emit();
  }
}

