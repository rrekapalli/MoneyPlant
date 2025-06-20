import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IWidget } from '../entities/IWidget';

/**
 * Maximum number of states to keep in history
 */
const MAX_HISTORY_SIZE = 50;

/**
 * Interface for dashboard state
 */
export interface DashboardState {
  widgets: IWidget[];
  timestamp: number;
}

/**
 * Service for managing undo/redo functionality in the dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {
  /**
   * History of dashboard states
   */
  private history: DashboardState[] = [];
  
  /**
   * Current position in history
   */
  private currentIndex = -1;
  
  /**
   * Subject for tracking can undo state
   */
  private canUndoSubject = new BehaviorSubject<boolean>(false);
  
  /**
   * Subject for tracking can redo state
   */
  private canRedoSubject = new BehaviorSubject<boolean>(false);
  
  /**
   * Subject for current state
   */
  private currentStateSubject = new BehaviorSubject<DashboardState | null>(null);
  
  constructor() {}
  
  /**
   * Observable for can undo state
   */
  get canUndo$(): Observable<boolean> {
    return this.canUndoSubject.asObservable();
  }
  
  /**
   * Observable for can redo state
   */
  get canRedo$(): Observable<boolean> {
    return this.canRedoSubject.asObservable();
  }
  
  /**
   * Observable for current state
   */
  get currentState$(): Observable<DashboardState | null> {
    return this.currentStateSubject.asObservable();
  }
  
  /**
   * Whether undo is available
   */
  get canUndo(): boolean {
    return this.currentIndex > 0;
  }
  
  /**
   * Whether redo is available
   */
  get canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
  
  /**
   * Adds a new state to the history
   * 
   * @param widgets - The current widgets array
   */
  addState(widgets: IWidget[]): void {
    // Create a deep copy of the widgets to avoid reference issues
    const widgetsCopy = JSON.parse(JSON.stringify(widgets));
    
    // Create new state
    const newState: DashboardState = {
      widgets: widgetsCopy,
      timestamp: Date.now()
    };
    
    // If we're not at the end of the history, remove all states after the current index
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add the new state
    this.history.push(newState);
    
    // Limit history size
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
    
    // Update subjects
    this.updateSubjects();
  }
  
  /**
   * Undoes the last change
   * 
   * @returns The previous state or null if no previous state exists
   */
  undo(): DashboardState | null {
    if (!this.canUndo) {
      return null;
    }
    
    this.currentIndex--;
    const state = this.history[this.currentIndex];
    
    // Update subjects
    this.updateSubjects();
    
    return state;
  }
  
  /**
   * Redoes the last undone change
   * 
   * @returns The next state or null if no next state exists
   */
  redo(): DashboardState | null {
    if (!this.canRedo) {
      return null;
    }
    
    this.currentIndex++;
    const state = this.history[this.currentIndex];
    
    // Update subjects
    this.updateSubjects();
    
    return state;
  }
  
  /**
   * Clears the history
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.updateSubjects();
  }
  
  /**
   * Updates the BehaviorSubjects with current state
   */
  private updateSubjects(): void {
    this.canUndoSubject.next(this.canUndo);
    this.canRedoSubject.next(this.canRedo);
    
    const currentState = this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
    this.currentStateSubject.next(currentState);
  }
}