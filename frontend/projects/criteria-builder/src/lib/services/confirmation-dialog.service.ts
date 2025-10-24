import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationDialogConfig {
  title: string;
  message: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonClass?: string;
  rejectButtonClass?: string;
  icon?: string;
  severity?: 'info' | 'warn' | 'error' | 'success';
  blockScroll?: boolean;
  closable?: boolean;
  dismissableMask?: boolean;
}

export interface ConfirmationResult {
  confirmed: boolean;
  data?: any;
}

/**
 * Service for managing confirmation dialogs in the criteria builder
 * Provides a consistent interface for destructive actions
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private confirmationSubject = new Subject<{
    config: ConfirmationDialogConfig;
    resolve: (result: ConfirmationResult) => void;
  }>();

  public confirmation$ = this.confirmationSubject.asObservable();

  constructor() {}

  /**
   * Show a confirmation dialog
   * @param config Configuration for the dialog
   * @returns Promise that resolves with the user's choice
   */
  confirm(config: ConfirmationDialogConfig): Promise<ConfirmationResult> {
    return new Promise((resolve) => {
      this.confirmationSubject.next({ config, resolve });
    });
  }

  /**
   * Show a delete confirmation dialog
   * @param itemName Name of the item being deleted
   * @param itemType Type of the item being deleted
   * @returns Promise that resolves with the user's choice
   */
  confirmDelete(itemName: string, itemType: string = 'item'): Promise<ConfirmationResult> {
    return this.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${itemType}? This action cannot be undone.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonClass: 'p-button-danger',
      icon: 'pi pi-exclamation-triangle',
      severity: 'warn'
    });
  }

  /**
   * Show a clear all confirmation dialog
   * @returns Promise that resolves with the user's choice
   */
  confirmClearAll(): Promise<ConfirmationResult> {
    return this.confirm({
      title: 'Clear All Criteria',
      message: 'Are you sure you want to clear all criteria? This will remove all conditions and groups.',
      acceptLabel: 'Clear All',
      rejectLabel: 'Cancel',
      acceptButtonClass: 'p-button-danger',
      icon: 'pi pi-trash',
      severity: 'warn'
    });
  }

  /**
   * Show a move confirmation dialog for complex moves
   * @param itemName Name of the item being moved
   * @param fromLocation Source location
   * @param toLocation Target location
   * @returns Promise that resolves with the user's choice
   */
  confirmMove(
    itemName: string, 
    fromLocation: string, 
    toLocation: string
  ): Promise<ConfirmationResult> {
    return this.confirm({
      title: 'Confirm Move',
      message: `Move "${itemName}" from ${fromLocation} to ${toLocation}?`,
      acceptLabel: 'Move',
      rejectLabel: 'Cancel',
      icon: 'pi pi-arrows-alt',
      severity: 'info'
    });
  }

  /**
   * Show a validation error confirmation dialog
   * @param errors List of validation errors
   * @returns Promise that resolves with the user's choice
   */
  confirmWithErrors(errors: string[]): Promise<ConfirmationResult> {
    const errorList = errors.map(error => `• ${error}`).join('\n');
    
    return this.confirm({
      title: 'Validation Errors',
      message: `The following errors were found:\n\n${errorList}\n\nDo you want to continue anyway?`,
      acceptLabel: 'Continue',
      rejectLabel: 'Cancel',
      acceptButtonClass: 'p-button-warning',
      icon: 'pi pi-exclamation-triangle',
      severity: 'warn'
    });
  }

  /**
   * Show a save changes confirmation dialog
   * @returns Promise that resolves with the user's choice
   */
  confirmUnsavedChanges(): Promise<ConfirmationResult> {
    return this.confirm({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Do you want to save them before continuing?',
      acceptLabel: 'Save',
      rejectLabel: 'Discard',
      icon: 'pi pi-save',
      severity: 'warn'
    });
  }

  /**
   * Show a custom confirmation dialog with multiple options
   * @param config Configuration with custom options
   * @returns Promise that resolves with the user's choice and selected option
   */
  confirmWithOptions(config: ConfirmationDialogConfig & {
    options?: { label: string; value: any; class?: string }[];
  }): Promise<ConfirmationResult & { selectedOption?: any }> {
    return new Promise((resolve) => {
      this.confirmationSubject.next({ 
        config, 
        resolve: (result) => resolve(result as ConfirmationResult & { selectedOption?: any })
      });
    });
  }

  /**
   * Create a default configuration for common scenarios
   */
  static createDefaultConfig(type: 'delete' | 'clear' | 'move' | 'error' | 'save'): Partial<ConfirmationDialogConfig> {
    const configs = {
      delete: {
        acceptLabel: 'Delete',
        rejectLabel: 'Cancel',
        acceptButtonClass: 'p-button-danger',
        icon: 'pi pi-trash',
        severity: 'warn' as const
      },
      clear: {
        acceptLabel: 'Clear',
        rejectLabel: 'Cancel',
        acceptButtonClass: 'p-button-danger',
        icon: 'pi pi-times',
        severity: 'warn' as const
      },
      move: {
        acceptLabel: 'Move',
        rejectLabel: 'Cancel',
        icon: 'pi pi-arrows-alt',
        severity: 'info' as const
      },
      error: {
        acceptLabel: 'Continue',
        rejectLabel: 'Cancel',
        acceptButtonClass: 'p-button-warning',
        icon: 'pi pi-exclamation-triangle',
        severity: 'error' as const
      },
      save: {
        acceptLabel: 'Save',
        rejectLabel: 'Discard',
        icon: 'pi pi-save',
        severity: 'warn' as const
      }
    };

    return configs[type];
  }
}