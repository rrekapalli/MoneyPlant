import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  QueryToken, 
  OverlayType, 
  OverlayConfig, 
  OverlayAction,
  DropdownOption 
} from '../models/token-system.interface';
import { FieldMeta } from '../models/field-meta.interface';
import { FunctionMeta } from '../models/function-meta.interface';
import { DropdownContentComponent } from './dropdown-content.component';
import { FunctionDialogContentComponent } from './function-dialog-content.component';
import { ValueInputContentComponent } from './value-input-content.component';
import { SimpleMenuItem } from './context-menu.component';

/**
 * Manages all overlay interactions including dropdowns, dialogs, context menus, and value inputs
 * Provides centralized overlay positioning, lifecycle management, and keyboard navigation
 */
@Component({
  selector: 'ac-interaction-overlay-manager',
  standalone: true,
  imports: [
    CommonModule,
    DropdownContentComponent,
    FunctionDialogContentComponent,
    ValueInputContentComponent
  ],
  templateUrl: './interaction-overlay-manager.component.html',
  styleUrls: ['./interaction-overlay-manager.component.scss']
})
export class InteractionOverlayManagerComponent implements OnInit, OnDestroy {
  @Input() activeOverlay: OverlayType | null = null;
  @Input() overlayConfig: OverlayConfig = {};
  @Input() targetToken: QueryToken | null = null;
  @Input() fields: FieldMeta[] = [];
  @Input() functions: FunctionMeta[] = [];
  
  @Output() overlayClose = new EventEmitter<void>();
  @Output() overlayAction = new EventEmitter<OverlayAction>();
  
  // ViewChild references removed since we're using basic HTML elements
  
  showFunctionDialog = false;
  contextMenuItems: SimpleMenuItem[] = [];
  
  private destroy$ = new Subject<void>();
  private currentTargetElement: HTMLElement | null = null;
  
  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.setupKeyboardNavigation();
    this.setupClickOutsideHandler();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Shows the appropriate overlay based on type and configuration
   */
  showOverlay(targetElement: HTMLElement, overlayType: OverlayType, config: OverlayConfig) {
    this.currentTargetElement = targetElement;
    this.overlayConfig = { ...config, type: overlayType };
    
    switch (overlayType) {
      case 'dropdown':
        this.showDropdownOverlay(targetElement);
        break;
      case 'dialog':
        this.showFunctionDialog = true;
        break;
      case 'contextmenu':
        this.showContextMenu(targetElement);
        break;
      case 'valueInput':
        this.showValueInputOverlay(targetElement);
        break;
    }
    
    this.cdr.detectChanges();
  }
  
  /**
   * Hides all overlays and cleans up state
   */
  hideOverlay() {
    this.showFunctionDialog = false;
    
    this.activeOverlay = null;
    this.currentTargetElement = null;
    this.overlayConfig = {};
    
    this.overlayClose.emit();
  }
  
  /**
   * Shows dropdown overlay with proper positioning
   */
  private showDropdownOverlay(targetElement: HTMLElement) {
    this.activeOverlay = 'dropdown';
    // Positioning logic would be implemented here for basic HTML overlays
  }
  
  /**
   * Shows value input overlay with proper positioning
   */
  private showValueInputOverlay(targetElement: HTMLElement) {
    this.activeOverlay = 'valueInput';
    // Positioning logic would be implemented here for basic HTML overlays
  }
  
  /**
   * Shows context menu with dynamic menu items
   */
  private showContextMenu(targetElement: HTMLElement) {
    this.contextMenuItems = this.buildContextMenuItems();
    this.activeOverlay = 'contextmenu';
    // Positioning logic would be implemented here for basic HTML overlays
  }
  
  /**
   * Builds context menu items based on target token
   */
  private buildContextMenuItems(): SimpleMenuItem[] {
    if (!this.targetToken) return [];
    
    const items: SimpleMenuItem[] = [];
    
    if (this.targetToken.isEditable) {
      items.push({
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.onContextMenuAction('edit')
      });
    }
    
    if (this.targetToken.isDeletable) {
      items.push({
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.onContextMenuAction('delete')
      });
    }
    
    // Add copy/cut/paste actions
    items.push(
      { separator: true },
      {
        label: 'Copy',
        icon: 'pi pi-copy',
        command: () => this.onContextMenuAction('copy')
      },
      {
        label: 'Cut',
        icon: 'pi pi-times',
        command: () => this.onContextMenuAction('cut')
      },
      {
        label: 'Paste',
        icon: 'pi pi-clone',
        command: () => this.onContextMenuAction('paste'),
        disabled: !this.hasClipboardData()
      }
    );
    
    return items;
  }
  
  /**
   * Handles context menu actions
   */
  private onContextMenuAction(actionType: string) {
    if (!this.targetToken) return;
    
    const action: OverlayAction = {
      type: actionType as any,
      payload: { actionType },
      targetToken: this.targetToken
    };
    
    this.overlayAction.emit(action);
    this.hideOverlay();
  }
  
  /**
   * Handles dropdown option selection
   */
  onDropdownSelect(option: DropdownOption) {
    if (!this.targetToken) return;
    
    const action: OverlayAction = {
      type: 'select',
      payload: option,
      targetToken: this.targetToken
    };
    
    this.overlayAction.emit(action);
    this.hideOverlay();
  }
  
  /**
   * Handles function dialog confirmation
   */
  onFunctionConfirm(functionData: any) {
    if (!this.targetToken) return;
    
    const action: OverlayAction = {
      type: 'confirm',
      payload: functionData,
      targetToken: this.targetToken
    };
    
    this.overlayAction.emit(action);
    this.hideOverlay();
  }
  
  /**
   * Handles value input confirmation
   */
  onValueConfirm(value: any) {
    if (!this.targetToken) return;
    
    const action: OverlayAction = {
      type: 'confirm',
      payload: { value },
      targetToken: this.targetToken
    };
    
    this.overlayAction.emit(action);
    this.hideOverlay();
  }
  
  /**
   * Sets up keyboard navigation for overlays
   */
  private setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      if (!this.activeOverlay) return;
      
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          this.hideOverlay();
          break;
        case 'Enter':
          if (this.activeOverlay === 'dropdown' || this.activeOverlay === 'valueInput') {
            event.preventDefault();
            this.handleEnterKey();
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          if (this.activeOverlay === 'dropdown') {
            event.preventDefault();
            this.handleArrowNavigation(event.key === 'ArrowDown');
          }
          break;
      }
    });
  }
  
  /**
   * Sets up click outside handler for overlays
   */
  private setupClickOutsideHandler() {
    document.addEventListener('click', (event) => {
      if (!this.activeOverlay || !this.overlayConfig.closeOnClickOutside) return;
      
      const target = event.target as HTMLElement;
      const overlayElement = this.elementRef.nativeElement;
      
      // Check if click is outside overlay and target element
      if (!overlayElement.contains(target) && 
          this.currentTargetElement && 
          !this.currentTargetElement.contains(target)) {
        this.hideOverlay();
      }
    });
  }
  
  /**
   * Handles Enter key press in overlays
   */
  private handleEnterKey() {
    // Implementation depends on active overlay type
    // This would be expanded based on specific overlay content
  }
  
  /**
   * Handles arrow key navigation in dropdowns
   */
  private handleArrowNavigation(isDown: boolean) {
    // Implementation for keyboard navigation in dropdown options
    // This would be expanded based on dropdown content component
  }
  
  /**
   * Checks if clipboard has data for paste operation
   */
  private hasClipboardData(): boolean {
    // This would check for stored clipboard data
    // Implementation depends on clipboard service
    return false;
  }
  
  /**
   * Handles overlay close events
   */
  onOverlayClose() {
    this.hideOverlay();
  }
}