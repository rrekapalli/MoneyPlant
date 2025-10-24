import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { take } from 'rxjs/operators';

export interface UndoAction {
  id: string;
  type: 'delete' | 'move' | 'edit';
  description: string;
  data: any;
  timestamp: number;
  timeout: number;
}

export interface UndoState {
  action: UndoAction | null;
  isActive: boolean;
  timeRemaining: number;
}

/**
 * Service for managing undo functionality in the criteria builder
 * Provides undo capabilities for delete operations with configurable timeout
 */
@Injectable({
  providedIn: 'root'
})
export class UndoService {
  private undoStateSubject = new BehaviorSubject<UndoState>({
    action: null,
    isActive: false,
    timeRemaining: 0
  });

  private currentTimeout: any = null;
  private currentCountdown: any = null;

  public undoState$ = this.undoStateSubject.asObservable();

  constructor() {}

  /**
   * Register an undo action
   * @param action The undo action to register
   * @returns Observable that emits when the action expires or is executed
   */
  registerUndoAction(action: UndoAction): Observable<'expired' | 'executed'> {
    // Clear any existing undo action
    this.clearCurrentAction();

    // Set the new action as active
    this.undoStateSubject.next({
      action,
      isActive: true,
      timeRemaining: action.timeout
    });

    // Start countdown
    this.startCountdown(action.timeout);

    // Return observable that completes when action expires or is executed
    return new Observable(observer => {
      const timeout = setTimeout(() => {
        this.clearCurrentAction();
        observer.next('expired');
        observer.complete();
      }, action.timeout);

      // Store timeout reference for potential clearing
      this.currentTimeout = timeout;

      // Return cleanup function
      return () => {
        if (this.currentTimeout) {
          clearTimeout(this.currentTimeout);
          this.currentTimeout = null;
        }
      };
    });
  }

  /**
   * Execute the current undo action
   * @returns The undo action data if successful, null if no action available
   */
  executeUndo(): any | null {
    const currentState = this.undoStateSubject.value;
    
    if (!currentState.isActive || !currentState.action) {
      return null;
    }

    const actionData = currentState.action.data;
    this.clearCurrentAction();
    
    return actionData;
  }

  /**
   * Cancel the current undo action
   */
  cancelUndo(): void {
    this.clearCurrentAction();
  }

  /**
   * Check if there's an active undo action
   */
  hasActiveUndo(): boolean {
    return this.undoStateSubject.value.isActive;
  }

  /**
   * Get the current undo action
   */
  getCurrentAction(): UndoAction | null {
    return this.undoStateSubject.value.action;
  }

  /**
   * Clear the current undo action and cleanup timers
   */
  private clearCurrentAction(): void {
    // Clear timeout
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    // Clear countdown
    if (this.currentCountdown) {
      clearInterval(this.currentCountdown);
      this.currentCountdown = null;
    }

    // Reset state
    this.undoStateSubject.next({
      action: null,
      isActive: false,
      timeRemaining: 0
    });
  }

  /**
   * Start countdown timer for undo action
   */
  private startCountdown(totalTime: number): void {
    let remaining = totalTime;
    
    this.currentCountdown = setInterval(() => {
      remaining -= 100; // Update every 100ms for smooth countdown
      
      if (remaining <= 0) {
        this.clearCurrentAction();
        return;
      }

      // Update time remaining
      const currentState = this.undoStateSubject.value;
      if (currentState.isActive) {
        this.undoStateSubject.next({
          ...currentState,
          timeRemaining: remaining
        });
      }
    }, 100);
  }

  /**
   * Create a delete undo action
   */
  createDeleteAction(
    id: string,
    description: string,
    data: any,
    timeout: number = 5000
  ): UndoAction {
    return {
      id,
      type: 'delete',
      description,
      data,
      timestamp: Date.now(),
      timeout
    };
  }

  /**
   * Create a move undo action
   */
  createMoveAction(
    id: string,
    description: string,
    data: any,
    timeout: number = 5000
  ): UndoAction {
    return {
      id,
      type: 'move',
      description,
      data,
      timestamp: Date.now(),
      timeout
    };
  }

  /**
   * Create an edit undo action
   */
  createEditAction(
    id: string,
    description: string,
    data: any,
    timeout: number = 5000
  ): UndoAction {
    return {
      id,
      type: 'edit',
      description,
      data,
      timestamp: Date.now(),
      timeout
    };
  }
}