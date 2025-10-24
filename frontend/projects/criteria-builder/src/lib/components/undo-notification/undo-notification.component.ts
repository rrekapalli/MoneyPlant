import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { UndoService, UndoState } from '../../services/undo.service';

/**
 * Component for displaying undo notifications with countdown timer
 * Shows when delete operations can be undone with visual countdown
 */
@Component({
  selector: 'mp-undo-notification',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressBarModule,
    TooltipModule
  ],
  template: `
    <div 
      class="undo-notification"
      *ngIf="undoState.isActive"
      [class.compact]="compactMode"
      [@slideIn]
      role="alert"
      aria-live="polite"
      [attr.aria-label]="getAriaLabel()">
      
      <!-- Undo message -->
      <div class="undo-message">
        <i class="pi pi-info-circle undo-icon"></i>
        <span class="undo-text">{{ undoState.action?.description || 'Action performed' }}</span>
      </div>
      
      <!-- Countdown progress -->
      <div class="undo-progress" *ngIf="showProgress">
        <p-progressBar 
          [value]="progressValue"
          [showValue]="false"
          styleClass="undo-progress-bar">
        </p-progressBar>
        <span class="time-remaining">{{ formatTimeRemaining(undoState.timeRemaining) }}</span>
      </div>
      
      <!-- Action buttons -->
      <div class="undo-actions">
        <p-button
          label="Undo"
          icon="pi pi-undo"
          [size]="compactMode ? 'small' : undefined"
          severity="secondary"
          [outlined]="true"
          (click)="onUndo()"
          [disabled]="!undoState.isActive"
          pTooltip="Undo the last action"
          tooltipPosition="top"
          [attr.aria-label]="'Undo: ' + undoState.action?.description">
        </p-button>
        
        <p-button
          icon="pi pi-times"
          [size]="compactMode ? 'small' : undefined"
          severity="secondary"
          [text]="true"
          (click)="onDismiss()"
          [disabled]="!undoState.isActive"
          pTooltip="Dismiss notification"
          tooltipPosition="top"
          [attr.aria-label]="'Dismiss undo notification'">
        </p-button>
      </div>
    </div>
  `,
  styleUrls: ['./undo-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Add slide-in animation
  ]
})
export class UndoNotificationComponent implements OnInit, OnDestroy {
  @Input() compactMode = false;
  @Input() showProgress = true;
  @Input() position: 'top' | 'bottom' = 'bottom';
  
  @Output() undoExecuted = new EventEmitter<any>();
  @Output() undoDismissed = new EventEmitter<void>();

  undoState: UndoState = {
    action: null,
    isActive: false,
    timeRemaining: 0
  };

  private undoSubscription?: Subscription;

  constructor(
    private undoService: UndoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.undoSubscription = this.undoService.undoState$.subscribe(state => {
      this.undoState = state;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.undoSubscription) {
      this.undoSubscription.unsubscribe();
    }
  }

  /**
   * Get progress value as percentage
   */
  get progressValue(): number {
    if (!this.undoState.action || this.undoState.timeRemaining <= 0) {
      return 0;
    }
    
    const elapsed = this.undoState.action.timeout - this.undoState.timeRemaining;
    return (elapsed / this.undoState.action.timeout) * 100;
  }

  /**
   * Handle undo button click
   */
  onUndo(): void {
    const undoData = this.undoService.executeUndo();
    if (undoData) {
      this.undoExecuted.emit(undoData);
    }
  }

  /**
   * Handle dismiss button click
   */
  onDismiss(): void {
    this.undoService.cancelUndo();
    this.undoDismissed.emit();
  }

  /**
   * Format time remaining for display
   */
  formatTimeRemaining(timeMs: number): string {
    const seconds = Math.ceil(timeMs / 1000);
    return `${seconds}s`;
  }

  /**
   * Get ARIA label for the notification
   */
  getAriaLabel(): string {
    if (!this.undoState.action) {
      return 'Undo notification';
    }
    
    const timeRemaining = this.formatTimeRemaining(this.undoState.timeRemaining);
    return `${this.undoState.action.description}. Undo available for ${timeRemaining}`;
  }
}