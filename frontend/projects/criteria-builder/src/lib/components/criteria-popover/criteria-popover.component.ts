import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG imports
import { Popover } from 'primeng/popover';
import { PopoverModule } from 'primeng/popover';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

// Local imports
import { PopoverContext, PopoverSelectionEvent, PopoverTab, PopoverOption } from '../../interfaces/popover-context.interface';
import { FieldsTabComponent } from './tabs/fields-tab.component';
import { OperatorsTabComponent } from './tabs/operators-tab.component';
import { FunctionsTabComponent } from './tabs/functions-tab.component';

@Component({
  selector: 'mp-criteria-popover',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PopoverModule,
    TabsModule,
    ButtonModule,
    InputTextModule,
    ListboxModule,
    ProgressSpinnerModule,
    MessageModule,
    FieldsTabComponent,
    OperatorsTabComponent,
    FunctionsTabComponent
  ],
  templateUrl: './criteria-popover.component.html',
  styleUrls: ['./criteria-popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriteriaPopoverComponent implements OnInit, OnDestroy {
  @ViewChild('popover') popover!: Popover;

  @Input() context: PopoverContext | null = null;
  @Input() visible: boolean = false;

  @Output() selectionChange = new EventEmitter<PopoverSelectionEvent>();
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() tabChange = new EventEmitter<PopoverTab>();

  // Internal state
  searchTerm: string = '';

  private destroy$ = new Subject<void>();



  ngOnInit(): void {
    this.updateActiveTab();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Show the popover relative to a target element
   */
  show(event: Event): void {
    if (this.popover && this.context) {
      this.popover.show(event);
      this.visibilityChange.emit(true);
    }
  }

  /**
   * Hide the popover
   */
  hide(): void {
    if (this.popover) {
      this.popover.hide();
      this.visibilityChange.emit(false);
    }
  }

  /**
   * Get active tab value for PrimeNG tabs
   */
  getActiveTabValue(): string {
    return this.context?.activeTab || 'fields';
  }



  /**
   * Handle search input
   */
  onSearchChange(): void {
    // Search is now handled by individual tab components
  }

  /**
   * Get visible tabs based on context
   */
  getVisibleTabs(): PopoverTab[] {
    return this.context?.visibleTabs || [];
  }



  /**
   * Check if popover is in loading state
   */
  isLoading(): boolean {
    return this.context?.isLoading || false;
  }

  /**
   * Get error message if any
   */
  getErrorMessage(): string | null {
    return this.context?.error || null;
  }

  /**
   * Update active tab based on context
   */
  private updateActiveTab(): void {
    if (!this.context) {
      return;
    }

    const visibleTabs = this.getVisibleTabs();
    if (!visibleTabs.includes(this.context.activeTab)) {
      this.context.activeTab = visibleTabs[0] || 'fields';
    }
  }

  /**
   * Track function for categories
   */
  trackByCategory(index: number, category: string): string {
    return category;
  }

  /**
   * Get selected field ID from context
   */
  getSelectedFieldId(): string | null {
    // This would be set based on the current chip context
    // For now, return null - this will be implemented when integrating with chips
    return this.context?.metadata?.['selectedFieldId'] || null;
  }

  /**
   * Handle option selection from tab components
   */
  onOptionSelect(option: PopoverOption): void {
    if (!this.context || option.disabled) {
      return;
    }

    const event: PopoverSelectionEvent = {
      option,
      tab: this.context.activeTab,
      chipId: this.context.chipId,
      data: option.data
    };

    this.selectionChange.emit(event);
    this.hide();
  }
}