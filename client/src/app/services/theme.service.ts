import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    // Backgrounds
    bodyBg: string;
    cardBg: string;
    headerBg: string;
    
    // Primary colors
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryDark: string;
    
    // Borders
    border: string;
    borderLight: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Status colors
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    danger: string;
    dangerLight: string;
    
    // Gradients
    gradientStart: string;
    gradientEnd: string;
    cardGradientStart: string;
    cardGradientEnd: string;
    
    // Suit colors
    suitRed: string;
    suitDark: string;
  };
}

export const COLOR_PALETTES: { [key: string]: ColorPalette } = {
  orange: {
    id: 'orange',
    name: 'Warm Orange',
    colors: {
      bodyBg: 'linear-gradient(to bottom right, #fff7ed, #fed7aa)',
      cardBg: '#ffffff',
      headerBg: 'linear-gradient(to right, #fff7ed, #fed7aa)',
      
      primary: '#f97316',
      primaryHover: '#ea580c',
      primaryLight: '#ffedd5',
      primaryDark: '#c2410c',
      
      border: '#fed7aa',
      borderLight: '#ffedd5',
      
      textPrimary: '#1c1917',
      textSecondary: '#78716c',
      textMuted: '#a8a29e',
      
      success: '#22c55e',
      successLight: '#dcfce7',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      danger: '#ef4444',
      dangerLight: '#fee2e2',
      
      gradientStart: '#fff7ed',
      gradientEnd: '#fed7aa',
      cardGradientStart: '#ffedd5',
      cardGradientEnd: '#fed7aa',
      
      suitRed: '#dc2626',
      suitDark: '#49505e',
    }
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai Dark',
    colors: {
      bodyBg: 'linear-gradient(to bottom right, #272822, #1e1f1c)',
      cardBg: '#3e3d32',
      headerBg: 'linear-gradient(to right, #2d2e27, #3e3d32)',
      
      primary: '#a6e22e',
      primaryHover: '#8fd01f',
      primaryLight: '#49483e',
      primaryDark: '#75b819',
      
      border: '#75715e',
      borderLight: '#49483e',
      
      textPrimary: '#f8f8f2',
      textSecondary: '#cfcfc2',
      textMuted: '#75715e',
      
      success: '#a6e22e',
      successLight: '#49483e',
      warning: '#e6db74',
      warningLight: '#49483e',
      danger: '#f92672',
      dangerLight: '#49483e',
      
      gradientStart: '#272822',
      gradientEnd: '#1e1f1c',
      cardGradientStart: '#3e3d32',
      cardGradientEnd: '#49483e',
      
      suitRed: '#f92672',
      suitDark: '#a8a29e',
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'pointing-poker-theme';
  private currentThemeSubject: BehaviorSubject<ColorPalette>;
  public currentTheme$: Observable<ColorPalette>;

  constructor() {
    const savedThemeId = localStorage.getItem(this.THEME_STORAGE_KEY) || 'orange';
    const initialTheme = COLOR_PALETTES[savedThemeId] || COLOR_PALETTES['orange'];
    this.currentThemeSubject = new BehaviorSubject<ColorPalette>(initialTheme);
    this.currentTheme$ = this.currentThemeSubject.asObservable();
    
    // Apply theme on initialization
    this.applyTheme(initialTheme);
  }

  get currentTheme(): ColorPalette {
    return this.currentThemeSubject.value;
  }

  setTheme(themeId: string): void {
    const theme = COLOR_PALETTES[themeId];
    if (theme) {
      this.currentThemeSubject.next(theme);
      localStorage.setItem(this.THEME_STORAGE_KEY, themeId);
      this.applyTheme(theme);
    }
  }

  getAvailableThemes(): ColorPalette[] {
    return Object.values(COLOR_PALETTES);
  }

  private applyTheme(theme: ColorPalette): void {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--body-bg', theme.colors.bodyBg);
    root.style.setProperty('--card-bg', theme.colors.cardBg);
    root.style.setProperty('--header-bg', theme.colors.headerBg);
    
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--primary-hover', theme.colors.primaryHover);
    root.style.setProperty('--primary-light', theme.colors.primaryLight);
    root.style.setProperty('--primary-dark', theme.colors.primaryDark);
    
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--border-light', theme.colors.borderLight);
    
    root.style.setProperty('--text-primary', theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--text-muted', theme.colors.textMuted);
    
    root.style.setProperty('--success', theme.colors.success);
    root.style.setProperty('--success-light', theme.colors.successLight);
    root.style.setProperty('--warning', theme.colors.warning);
    root.style.setProperty('--warning-light', theme.colors.warningLight);
    root.style.setProperty('--danger', theme.colors.danger);
    root.style.setProperty('--danger-light', theme.colors.dangerLight);
    
    root.style.setProperty('--gradient-start', theme.colors.gradientStart);
    root.style.setProperty('--gradient-end', theme.colors.gradientEnd);
    root.style.setProperty('--card-gradient-start', theme.colors.cardGradientStart);
    root.style.setProperty('--card-gradient-end', theme.colors.cardGradientEnd);
    
    root.style.setProperty('--suit-red', theme.colors.suitRed);
    root.style.setProperty('--suit-dark', theme.colors.suitDark);
  }
}

