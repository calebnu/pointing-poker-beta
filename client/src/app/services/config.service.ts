import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly DONATION_MODAL_KEY = 'pointing-poker-show-donation';
  
  constructor() {
    // Initialize from localStorage if exists
    const stored = localStorage.getItem(this.DONATION_MODAL_KEY);
    if (stored !== null) {
      this._showDonationModal = stored === 'true';
    }
  }

  private _showDonationModal = true;

  get showDonationModal(): boolean {
    return this._showDonationModal;
  }

  set showDonationModal(value: boolean) {
    this._showDonationModal = value;
    localStorage.setItem(this.DONATION_MODAL_KEY, value.toString());
  }
}

