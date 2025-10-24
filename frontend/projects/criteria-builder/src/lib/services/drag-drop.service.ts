import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChipViewModel } from '../interfaces';

export interface DragDropState {
  isDragging: boolean;
  draggedItem: ChipViewModel | null;
  draggedFromGroup: string | null;
  validDropTargets: string[];
  dropZones: DropZone[];
}

export interface DropZone {
  id: string;
  groupId: string;
  position: 'before' | 'after' | 'inside';
  isValid: boolean;
  element?: HTMLElement;
}

export interface DragConstraints {
  maxDepth: number;
  maxElements: number;
  allowedTypes: string[];
  preventCircularNesting: boolean;
}

export interface DragDropResult {
  success: boolean;
  fromGroupId: string;
  toGroupId: string;
  fromIndex: number;
  toIndex: number;
  item: ChipViewModel;
  violatedConstraints?: string[];
}

/**
 * Service for managing enhanced drag-and-drop functionality
 * Provides visual feedback, drop zone management, and constraint validation
 */
@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  private dragDropStateSubject = new BehaviorSubject<DragDropState>({
    isDragging: false,
    draggedItem: null,
    draggedFromGroup: null,
    validDropTargets: [],
    dropZones: []
  });

  public dragDropState$ = this.dragDropStateSubject.asObservable();

  private constraints: DragConstraints = {
    maxDepth: 10,
    maxElements: 100,
    allowedTypes: ['group', 'condition', 'function', 'field', 'operator', 'value'],
    preventCircularNesting: true
  };

  constructor() {}

  /**
   * Set drag constraints
   */
  setConstraints(constraints: Partial<DragConstraints>): void {
    this.constraints = { ...this.constraints, ...constraints };
  }

  /**
   * Start drag operation
   */
  startDrag(item: ChipViewModel, fromGroupId: string): void {
    const validDropTargets = this.calculateValidDropTargets(item, fromGroupId);
    const dropZones = this.createDropZones(item, validDropTargets);

    this.dragDropStateSubject.next({
      isDragging: true,
      draggedItem: item,
      draggedFromGroup: fromGroupId,
      validDropTargets,
      dropZones
    });

    // Add visual feedback classes to document
    document.body.classList.add('criteria-dragging');
    this.highlightDropZones(dropZones);
  }

  /**
   * End drag operation
   */
  endDrag(): void {
    // Remove visual feedback
    document.body.classList.remove('criteria-dragging');
    this.clearDropZoneHighlights();

    // Reset state
    this.dragDropStateSubject.next({
      isDragging: false,
      draggedItem: null,
      draggedFromGroup: null,
      validDropTargets: [],
      dropZones: []
    });
  }

  /**
   * Validate drop operation
   */
  validateDrop(
    item: ChipViewModel,
    targetGroupId: string,
    targetIndex: number,
    allGroups: Map<string, ChipViewModel[]>
  ): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check if target group exists
    const targetGroup = allGroups.get(targetGroupId);
    if (!targetGroup) {
      violations.push('Target group does not exist');
      return { isValid: false, violations };
    }

    // Check element count constraint
    if (targetGroup.length >= this.constraints.maxElements) {
      violations.push(`Maximum elements (${this.constraints.maxElements}) exceeded`);
    }

    // Check depth constraint
    const targetDepth = this.calculateGroupDepth(targetGroupId, allGroups);
    if (targetDepth >= this.constraints.maxDepth) {
      violations.push(`Maximum depth (${this.constraints.maxDepth}) exceeded`);
    }

    // Check type constraints
    if (!this.constraints.allowedTypes.includes(item.type)) {
      violations.push(`Type '${item.type}' is not allowed`);
    }

    // Check circular nesting (if item is a group)
    if (this.constraints.preventCircularNesting && item.type === 'group') {
      if (this.wouldCreateCircularNesting(item.id, targetGroupId, allGroups)) {
        violations.push('Circular nesting is not allowed');
      }
    }

    // Check if dropping into itself or its children
    if (item.type === 'group' && this.isDescendantGroup(targetGroupId, item.id, allGroups)) {
      violations.push('Cannot drop group into itself or its descendants');
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * Execute drop operation with validation
   */
  executeDrop(
    fromGroupId: string,
    toGroupId: string,
    fromIndex: number,
    toIndex: number,
    allGroups: Map<string, ChipViewModel[]>
  ): DragDropResult {
    const currentState = this.dragDropStateSubject.value;
    
    if (!currentState.isDragging || !currentState.draggedItem) {
      return {
        success: false,
        fromGroupId,
        toGroupId,
        fromIndex,
        toIndex,
        item: currentState.draggedItem!,
        violatedConstraints: ['No active drag operation']
      };
    }

    const validation = this.validateDrop(
      currentState.draggedItem,
      toGroupId,
      toIndex,
      allGroups
    );

    if (!validation.isValid) {
      return {
        success: false,
        fromGroupId,
        toGroupId,
        fromIndex,
        toIndex,
        item: currentState.draggedItem,
        violatedConstraints: validation.violations
      };
    }

    return {
      success: true,
      fromGroupId,
      toGroupId,
      fromIndex,
      toIndex,
      item: currentState.draggedItem
    };
  }

  /**
   * Get current drag state
   */
  getCurrentDragState(): DragDropState {
    return this.dragDropStateSubject.value;
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.dragDropStateSubject.value.isDragging;
  }

  /**
   * Calculate valid drop targets for an item
   */
  private calculateValidDropTargets(item: ChipViewModel, fromGroupId: string): string[] {
    // For now, return all groups except the source group
    // This would be enhanced based on business rules
    const validTargets: string[] = [];
    
    // Add logic to determine valid drop targets based on:
    // - Item type
    // - Current nesting level
    // - Group constraints
    // - Business rules
    
    return validTargets;
  }

  /**
   * Create drop zones for visual feedback
   */
  private createDropZones(item: ChipViewModel, validTargets: string[]): DropZone[] {
    const dropZones: DropZone[] = [];
    
    validTargets.forEach(targetId => {
      // Create drop zones before, after, and inside each valid target
      dropZones.push(
        {
          id: `${targetId}-before`,
          groupId: targetId,
          position: 'before',
          isValid: true
        },
        {
          id: `${targetId}-after`,
          groupId: targetId,
          position: 'after',
          isValid: true
        },
        {
          id: `${targetId}-inside`,
          groupId: targetId,
          position: 'inside',
          isValid: true
        }
      );
    });
    
    return dropZones;
  }

  /**
   * Calculate the depth of a group in the hierarchy
   */
  private calculateGroupDepth(groupId: string, allGroups: Map<string, ChipViewModel[]>): number {
    // Implementation would traverse the group hierarchy to calculate depth
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Check if dropping would create circular nesting
   */
  private wouldCreateCircularNesting(
    itemId: string,
    targetGroupId: string,
    allGroups: Map<string, ChipViewModel[]>
  ): boolean {
    // Implementation would check if targetGroupId is a descendant of itemId
    // For now, return false as placeholder
    return false;
  }

  /**
   * Check if targetGroupId is a descendant of parentGroupId
   */
  private isDescendantGroup(
    targetGroupId: string,
    parentGroupId: string,
    allGroups: Map<string, ChipViewModel[]>
  ): boolean {
    // Implementation would traverse the hierarchy to check descendant relationship
    // For now, return false as placeholder
    return false;
  }

  /**
   * Highlight drop zones visually
   */
  private highlightDropZones(dropZones: DropZone[]): void {
    dropZones.forEach(zone => {
      const element = document.querySelector(`[data-drop-zone="${zone.id}"]`) as HTMLElement;
      if (element) {
        element.classList.add('drop-zone-active');
        if (zone.isValid) {
          element.classList.add('drop-zone-valid');
        } else {
          element.classList.add('drop-zone-invalid');
        }
      }
    });
  }

  /**
   * Clear drop zone highlights
   */
  private clearDropZoneHighlights(): void {
    const dropZoneElements = document.querySelectorAll('.drop-zone-active');
    dropZoneElements.forEach(element => {
      element.classList.remove('drop-zone-active', 'drop-zone-valid', 'drop-zone-invalid');
    });
  }

  /**
   * Create visual drop indicator
   */
  createDropIndicator(position: { x: number; y: number }): HTMLElement {
    const indicator = document.createElement('div');
    indicator.className = 'drag-drop-indicator';
    indicator.style.position = 'fixed';
    indicator.style.left = `${position.x}px`;
    indicator.style.top = `${position.y}px`;
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '9999';
    indicator.innerHTML = '<i class="pi pi-arrow-down"></i>';
    
    document.body.appendChild(indicator);
    return indicator;
  }

  /**
   * Remove drop indicator
   */
  removeDropIndicator(indicator: HTMLElement): void {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }
}