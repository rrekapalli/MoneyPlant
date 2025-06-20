import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {IFilterValues} from '../../entities/IFilterValues';
import {IFilterOptions} from '../../entities/IFilterOptions';

/**
 * Component for displaying and managing filter values
 */
@Component({
  selector: 'vis-filters',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class FilterComponent implements OnInit {
  /** The widget configuration */
  @Input() widget!: IWidget;

  /** Event emitter for filter updates */
  @Input() onUpdateFilter!: EventEmitter<any>;

  /** Internal storage for filter values to prevent infinite loops */
  private _filterValues: IFilterValues[] = [];

  /**
   * Initializes the component
   */
  ngOnInit(): void {
    // Initialize filter values from widget config
    const filters = this.widget.config.options as IFilterOptions;
    if (filters && filters.values && filters.values.length > 0) {
      this._filterValues = [...filters.values as IFilterValues[]];
    }
  }

  /**
   * Gets the current filter values
   * @returns Array of filter values
   */
  get filterValues(): IFilterValues[] {
    return this._filterValues;
  }

  /**
   * Sets the filter values and updates the widget configuration
   * @param values - The new filter values
   */
  set filterValues(values: IFilterValues[]) {
    if (values && values.length > 0) {
      this._filterValues = [...values];
      (this.widget.config.options as IFilterOptions).values = [...this._filterValues];
    } else {
      this._filterValues = [];
      (this.widget.config.options as IFilterOptions).values = [];
    }
  }

  /**
   * Clears all filter values
   * 
   * @param item - The item that triggered the clear action
   */
  clearAllFilters(item: any) {
    if (item) {
      this._filterValues = [];
      (this.widget.config.options as IFilterOptions).values = [];
      this.onUpdateFilter.emit([]);
    }
  }

  /**
   * Clears a specific filter value
   * 
   * @param item - The filter value to clear
   */
  clearFilter(item: any) {
    if (JSON.stringify(item).length > 0) {
      const index = this._filterValues.indexOf(item);
      if (index !== -1) {
        this._filterValues.splice(index, 1);
        (this.widget.config.options as IFilterOptions).values = [...this._filterValues];
        this.onUpdateFilter.emit([...this._filterValues]);
      }
    }
  }
}
