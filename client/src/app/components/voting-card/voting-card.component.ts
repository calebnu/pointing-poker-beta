import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Suit {
  symbol: string;
  colorClass: string; // CSS class for theming
}

@Component({
  selector: 'app-voting-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voting-card.component.html',
  styleUrls: ['./voting-card.component.css']
})
export class VotingCardComponent implements OnInit {
  @Input() value!: string;
  @Input() index: number = 0;
  @Input() selected = false;
  @Input() disabled = false;
  @Output() voteSelected = new EventEmitter<string>();

  cardSuit!: Suit;

  private readonly suits: Suit[] = [
    { symbol: '♣', colorClass: 'suit-dark' },      // clubs (dark color)
    { symbol: '♦', colorClass: 'suit-red' },       // diamonds (red)
    { symbol: '♠', colorClass: 'suit-dark' },      // spades (dark color)
    { symbol: '♥', colorClass: 'suit-red' }        // hearts (red)
  ];

  ngOnInit(): void {
    // Assign suit based on card index in progression
    const suitIndex = this.index % this.suits.length;
    this.cardSuit = this.suits[suitIndex];
  }

  onCardClick(): void {
    if (!this.disabled) {
      this.voteSelected.emit(this.value);
    }
  }
}

