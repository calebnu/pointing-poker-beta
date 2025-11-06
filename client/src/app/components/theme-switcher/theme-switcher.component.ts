import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ColorPalette } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.css']
})
export class ThemeSwitcherComponent {
  isOpen = false;
  availableThemes: ColorPalette[];
  currentTheme: ColorPalette;

  constructor(public themeService: ThemeService) {
    this.availableThemes = this.themeService.getAvailableThemes();
    this.currentTheme = this.themeService.currentTheme;
    
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
    this.isOpen = false;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}

