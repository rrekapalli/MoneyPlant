import {Component, EventEmitter, Input, OnInit, OnDestroy, inject, signal, computed, effect, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {IFilterValues} from '../../entities/IFilterValues';
import {IFilterOptions} from '../../entities/IFilterOptions';
import {FilterService} from '../../services/filter.service';

@Component({
  selector: 'vis-filters',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() widget!: IWidget;
  @Input() onUpdateFilter!: EventEmitter<any>;
  @Input() onDataLoad!: EventEmitter<any>;

  // Inject FilterService
  private filterService = inject(FilterService);
  
  // Computed property for filter values from FilterService (read-only)
  protected readonly filterValues = this.filterService.filterValues;
  
  // Computed property for whether filters are active
  protected readonly hasActiveFilters = this.filterService.hasActiveFilters;

  ngOnInit(): void {
    // No initialization needed - just display filters from service
  }

  ngOnDestroy(): void {
    // Effects are automatically cleaned up
  }

  /**
   * Clear all filters
   */
  clearAllFilters(event?: any): void {
    if (event) {
      console.log('🗑️ Filter Widget: Clearing all filters');
      this.filterService.clearAllFilters();
    }
  }

  /**
   * Clear a specific filter
   */
  clearFilter(filterToRemove: IFilterValues): void {
    if (filterToRemove) {
      console.log('🗑️ Filter Widget: Removing filter:', filterToRemove);
      this.filterService.removeFilterValue(filterToRemove);
    }
  }

  /**
   * Legacy getter for backward compatibility (now uses FilterService)
   */
  get legacyFilterValues(): IFilterValues[] {
    return this.filterValues();
  }

  /**
   * Legacy setter for backward compatibility (now updates FilterService)
   */
  set legacyFilterValues(values: IFilterValues[]) {
    if (values && Array.isArray(values)) {
      this.filterService.setFilterValues(values);
    }
  }
}
