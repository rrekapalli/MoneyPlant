import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SimpleMenuItem {
  label?: string;
  icon?: string;
  command?: () => void;
  disabled?: boolean;
  separator?: boolean;
  styleClass?: string;
}

import { QueryToken } from '../models/token-system.interface';

export interface ContextMenuAction {
  action: string;
  token: QueryToken;
  data?: any;
}

/**
 * Context menu component for token actions
 * Provides cut, copy, paste, delete operations for tokens
 */
@Component({
  selector: 'ac-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {
  @Input() targetToken: QueryToken | null = null;
  @Input() allowCopy: boolean = true;
  @Input() allowCut: boolean = true;
  @Input() allowPaste: boolean = true;
  @Input() allowDelete: boolean = true;
  @Input() allowEdit: boolean = true;
  @Input() hasClipboardData: boolean = false;
  
  @Output() menuAction = new EventEmitter<ContextMenuAction>();
  
  menuItems: SimpleMenuItem[] = [];
  
  ngOnInit() {
    this.buildMenuItems();
  }
  
  /**
   * Builds context menu items based on permissions and token state
   */
  private buildMenuItems(): SimpleMenuItem[] {
    this.menuItems = [];
    
    if (!this.targetToken) return this.menuItems;
    
    // Edit action
    if (this.allowEdit && this.targetToken.isEditable) {
      this.menuItems.push({
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.emitAction('edit')
      });
    }
    
    // Separator before clipboard actions
    if (this.menuItems.length > 0) {
      this.menuItems.push({ separator: true });
    }
    
    // Copy action
    if (this.allowCopy) {
      this.menuItems.push({
        label: 'Copy',
        icon: 'pi pi-copy',
        command: () => this.emitAction('copy')
      });
    }
    
    // Cut action
    if (this.allowCut && this.targetToken.isDeletable) {
      this.menuItems.push({
        label: 'Cut',
        icon: 'pi pi-times',
        command: () => this.emitAction('cut')
      });
    }
    
    // Paste action
    if (this.allowPaste) {
      this.menuItems.push({
        label: 'Paste',
        icon: 'pi pi-clone',
        disabled: !this.hasClipboardData,
        command: () => this.emitAction('paste')
      });
    }
    
    // Separator before delete action
    if (this.allowDelete && this.targetToken.isDeletable) {
      this.menuItems.push({ separator: true });
      
      this.menuItems.push({
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'delete-action',
        command: () => this.emitAction('delete')
      });
    }
    
    // Additional token-specific actions
    this.addTokenSpecificActions();
    
    return this.menuItems;
  }
  
  /**
   * Adds token-specific menu actions based on token type
   */
  private addTokenSpecificActions() {
    if (!this.targetToken) return;
    
    switch (this.targetToken.type) {
      case 'group':
        this.menuItems.push(
          { separator: true },
          {
            label: 'Add Condition',
            icon: 'pi pi-plus',
            command: () => this.emitAction('add-condition')
          },
          {
            label: 'Add Group',
            icon: 'pi pi-plus-circle',
            command: () => this.emitAction('add-group')
          }
        );
        break;
        
      case 'function':
        this.menuItems.push(
          { separator: true },
          {
            label: 'Configure Function',
            icon: 'pi pi-cog',
            command: () => this.emitAction('configure-function')
          }
        );
        break;
        
      case 'field':
        this.menuItems.push(
          { separator: true },
          {
            label: 'Change Field',
            icon: 'pi pi-refresh',
            command: () => this.emitAction('change-field')
          }
        );
        break;
        
      case 'operator':
        this.menuItems.push(
          { separator: true },
          {
            label: 'Change Operator',
            icon: 'pi pi-refresh',
            command: () => this.emitAction('change-operator')
          }
        );
        break;
        
      case 'value':
        this.menuItems.push(
          { separator: true },
          {
            label: 'Change Value',
            icon: 'pi pi-refresh',
            command: () => this.emitAction('change-value')
          }
        );
        break;
    }
  }
  
  /**
   * Emits menu action event
   */
  private emitAction(action: string) {
    if (!this.targetToken) return;
    
    const menuAction: ContextMenuAction = {
      action,
      token: this.targetToken,
      data: { timestamp: Date.now() }
    };
    
    this.menuAction.emit(menuAction);
  }
  
  /**
   * Updates menu items when inputs change
   */
  ngOnChanges() {
    this.buildMenuItems();
  }
}