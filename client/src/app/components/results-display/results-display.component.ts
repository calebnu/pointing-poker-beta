import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Participant, VoteStatistics } from '../../models/room.model';

@Component({
  selector: 'app-results-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-display.component.html',
  styleUrls: ['./results-display.component.css']
})
export class ResultsDisplayComponent implements OnChanges {
  @Input() participants: Participant[] = [];
  statistics: VoteStatistics = {
    average: null,
    mostCommon: null,
    distribution: {}
  };

  // Expose Object.keys to the template
  Object = Object;

  ngOnChanges(): void {
    this.calculateStatistics();
  }

  private calculateStatistics(): void {
    const numericVotes: number[] = [];
    const distribution: { [vote: string]: number } = {};

    this.participants.forEach(p => {
      if (p.vote) {
        // Count distribution
        distribution[p.vote] = (distribution[p.vote] || 0) + 1;

        // Collect numeric votes for average
        const numValue = parseFloat(p.vote);
        if (!isNaN(numValue)) {
          numericVotes.push(numValue);
        }
      }
    });

    // Calculate average
    const average = numericVotes.length > 0
      ? numericVotes.reduce((sum, val) => sum + val, 0) / numericVotes.length
      : null;

    // Find most common vote
    let mostCommon: string | null = null;
    let maxCount = 0;
    Object.entries(distribution).forEach(([vote, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = vote;
      }
    });

    this.statistics = {
      average: average ? Math.round(average * 10) / 10 : null,
      mostCommon,
      distribution
    };
  }

  getVoteCount(vote: string): number {
    return this.statistics.distribution[vote] || 0;
  }

  getMaxCount(): number {
    return Math.max(...Object.values(this.statistics.distribution));
  }

  hasDistribution(): boolean {
    return Object.keys(this.statistics.distribution).length > 0;
  }

  getBarGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, var(--primary), var(--primary-hover))',
      'linear-gradient(135deg, var(--success), #16a34a)',
      'linear-gradient(135deg, var(--warning), #d97706)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #06b6d4, #0891b2)'
    ];
    return gradients[index % gradients.length];
  }
}

