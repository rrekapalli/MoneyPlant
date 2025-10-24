import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { UndoService, UndoAction } from './undo.service';
import { ConfirmationDialogService, ConfirmationDialogConfig } from './confirmation-dialog.service';
import { ToastNotificationService } from './toast-notification.service';

export interface UserFeedbackConfig {
  enableUndo: boolean;
  enableConfirmations: boolean;
  enableToasts: boolean;
  undoTimeout: number;
  toastDefaults: {
    successLife: number;
    infoLife: number;
    warningLife: number;
    errorLife: number;
  };
}

/**
 * Comprehensive user feedback service
 * Coordinates undo, confirmation dialogs, and toast notifications
 */
@Injectable({
  providedIn: 'root'
})
export class UserFeedbackService {
  private config: UserFeedbackConfig = {
    enableUndo: true,
    enableConfirmations: true,
    enableToasts: true,
    undoTimeout: 5000,
    toastDefaults: {
      successLife: 3000,
      infoLife: 4000,
      warningLife: 5000,
      errorLife: 6000
    }
  };

  constructor(
    private undoService: UndoService,
    private confirmationService: ConfirmationDialogService,
    private toastService: ToastNotificationService
  ) {}

  /**
   * Configure the feedback service
   */
  configure(config: Partial<UserFeedbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Handle delete action with undo support
   */
  async handleDelete(
    itemName: string,
    itemType: string,
    deleteData: any,
    onDelete: () => void,
    skipConfirmation: boolean = false
  ): Promise<boolean> {
    // Show confirmation if enabled and not skipped
    if (this.config.enableConfirmations && !skipConfirmation) {
      const result = await this.confirmationService.confirmDelete(itemName, itemType);
      if (!result.confirmed) {
        return false;
      }
    }

    // Execute the delete
    onDelete();

    // Handle undo if enabled
    if (this.config.enableUndo) {
      const undoAction = this.undoService.createDeleteAction(
        `delete-${Date.now()}`,
        `Deleted ${itemType}: ${itemName}`,
        deleteData,
        this.config.undoTimeout
      );

      this.undoService.registerUndoAction(undoAction).subscribe(result => {
        if (result === 'expired') {
          this.showToast('info', 'Action Confirmed', `${itemType} permanently deleted`);
        }
      });

      this.showToast(
        'success',
        'Item Deleted',
        `${itemName} deleted. Undo available for ${this.config.undoTimeout / 1000} seconds.`,
        this.config.undoTimeout
      );
    } else {
      this.showToast('success', 'Deleted', `${itemName} deleted successfully`);
    }

    return true;
  }

  /**
   * Handle move action with undo support
   */
  handleMove(
    itemName: string,
    fromLocation: string,
    toLocation: string,
    moveData: any,
    onMove: () => void
  ): void {
    // Execute the move
    onMove();

    // Handle undo if enabled
    if (this.config.enableUndo) {
      const undoAction = this.undoService.createMoveAction(
        `move-${Date.now()}`,
        `Moved ${itemName} from ${fromLocation} to ${toLocation}`,
        moveData,
        this.config.undoTimeout
      );

      this.undoService.registerUndoAction(undoAction).subscribe();
    }

    this.showToast('success', 'Item Moved', `${itemName} moved successfully`);
  }

  /**
   * Handle validation errors with user feedback
   */
  async handleValidationErrors(
    errors: string[],
    allowContinue: boolean = false
  ): Promise<boolean> {
    if (errors.length === 0) {
      return true;
    }

    // Show error toast
    const errorSummary = `${errors.length} validation error${errors.length > 1 ? 's' : ''}`;
    this.showToast('error', errorSummary, errors.join(', '));

    // Show confirmation if user can continue despite errors
    if (allowContinue && this.config.enableConfirmations) {
      const result = await this.confirmationService.confirmWithErrors(errors);
      return result.confirmed;
    }

    return false;
  }

  /**
   * Show success feedback for completed actions
   */
  showSuccess(summary: string, detail: string, life?: number): void {
    this.showToast('success', summary, detail, life || this.config.toastDefaults.successLife);
  }

  /**
   * Show info feedback
   */
  showInfo(summary: string, detail: string, life?: number): void {
    this.showToast('info', summary, detail, life || this.config.toastDefaults.infoLife);
  }

  /**
   * Show warning feedback
   */
  showWarning(summary: string, detail: string, life?: number): void {
    this.showToast('warn', summary, detail, life || this.config.toastDefaults.warningLife);
  }

  /**
   * Show error feedback
   */
  showError(summary: string, detail: string, life?: number): void {
    this.showToast('error', summary, detail, life || this.config.toastDefaults.errorLife);
  }

  /**
   * Get current undo state
   */
  getUndoState(): Observable<any> {
    return this.undoService.undoState$;
  }

  /**
   * Execute current undo action
   */
  executeUndo(): any | null {
    const result = this.undoService.executeUndo();
    if (result) {
      this.showToast('success', 'Action Undone', 'Previous action has been undone');
    }
    return result;
  }

  /**
   * Cancel current undo action
   */
  cancelUndo(): void {
    this.undoService.cancelUndo();
  }

  /**
   * Show confirmation dialog
   */
  async confirm(config: ConfirmationDialogConfig): Promise<boolean> {
    if (!this.config.enableConfirmations) {
      return true;
    }
    
    const result = await this.confirmationService.confirm(config);
    return result.confirmed;
  }

  /**
   * Private method to show toast if enabled
   */
  private showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
    life?: number
  ): void {
    if (this.config.enableToasts) {
      this.toastService.show(severity, summary, detail, life);
    }
  }
}