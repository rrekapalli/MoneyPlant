import { Injectable, computed, effect, signal } from '@angular/core';

/**
 * Interface for the global settings state
 */
interface SettingsState {
  notificationRetentionMinutes: number;
  maxNotifications: number;
  // Add other global settings here as needed
}

/**
 * Initial state for settings
 */
const initialState: SettingsState = {
  notificationRetentionMinutes: 30, // Default: 30 minutes
  maxNotifications: 100 // Default: 100 notifications
};

@Injectable({
  providedIn: 'root'
})
export class SettingsStateService {
  // State signal
  private state = signal<SettingsState>(initialState);
  
  // Public readable signals
  public notificationRetentionMinutes = computed(() => this.state().notificationRetentionMinutes);
  public maxNotifications = computed(() => this.state().maxNotifications);
  
  constructor() {
    // Log state changes for debugging
    effect(() => {
      console.log('Settings state updated:', this.state());
    });
  }
  
  /**
   * Updates the state
   * @param newState Partial state to update
   */
  private updateState(newState: Partial<SettingsState>): void {
    this.state.update(state => ({
      ...state,
      ...newState
    }));
  }
  
  /**
   * Set the notification retention time in minutes
   * @param minutes Number of minutes to retain notifications
   */
  setNotificationRetentionMinutes(minutes: number): void {
    if (minutes < 1) {
      console.warn('Notification retention time must be at least 1 minute. Setting to 1 minute.');
      minutes = 1;
    }
    this.updateState({ notificationRetentionMinutes: minutes });
  }
  
  /**
   * Set the maximum number of notifications to store
   * @param max Maximum number of notifications
   */
  setMaxNotifications(max: number): void {
    if (max < 1) {
      console.warn('Maximum notifications must be at least 1. Setting to 1.');
      max = 1;
    }
    this.updateState({ maxNotifications: max });
  }
}