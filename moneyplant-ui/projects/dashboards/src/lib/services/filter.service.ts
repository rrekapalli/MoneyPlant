import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IFilterValues } from '../entities/IFilterValues';

export interface FilterEvent {
  widgetId: string;
  widgetTitle?: string;
  filterValue: IFilterValues;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterValuesSubject = new BehaviorSubject<IFilterValues[]>([]);
  private filterEventsSubject = new BehaviorSubject<FilterEvent[]>([]);
  private isUpdating = false;
  private updateTimeout?: any;

  public filterValues$: Observable<IFilterValues[]> = this.filterValuesSubject.asObservable();
  public filterEvents$: Observable<FilterEvent[]> = this.filterEventsSubject.asObservable();

  constructor() {}

  /**
   * Get current filter values
   */
  getFilterValues(): IFilterValues[] {
    return this.filterValuesSubject.value;
  }

  /**
   * Get current filter events
   */
  getFilterEvents(): FilterEvent[] {
    return this.filterEventsSubject.value;
  }

  /**
   * Add a new filter value from a chart click
   */
  addFilterValue(widgetId: string, widgetTitle: string, clickedData: any): void {
    if (this.isUpdating) {
      return; // Prevent infinite loop
    }

    const filterValue = this.createFilterValueFromClickData(clickedData);
    
    if (filterValue) {
      // Add widget information
      filterValue['widgetId'] = widgetId;
      filterValue['widgetTitle'] = widgetTitle;
      
      // Check for duplicates before adding
      const currentFilters = this.filterValuesSubject.value;
      const isDuplicate = currentFilters.some(existingFilter => 
        this.isSameFilter(existingFilter, filterValue)
      );
      
      if (isDuplicate) {
        return;
      }
      
      // Add to filter values
      const updatedFilters = [...currentFilters, filterValue];
      
      this.debouncedUpdate(updatedFilters);

      // Add to filter events
      const filterEvent: FilterEvent = {
        widgetId,
        widgetTitle,
        filterValue,
        timestamp: new Date()
      };
      
      const currentEvents = this.filterEventsSubject.value;
      const updatedEvents = [...currentEvents, filterEvent];
      this.filterEventsSubject.next(updatedEvents);
    }
  }

  /**
   * Remove a specific filter value
   */
  removeFilterValue(filterToRemove: IFilterValues): void {
    if (this.isUpdating) {
      return; // Prevent infinite loop
    }

    const currentFilters = this.filterValuesSubject.value;
    const updatedFilters = currentFilters.filter(filter => 
      !this.isSameFilter(filter, filterToRemove)
    );
    
    this.debouncedUpdate(updatedFilters);
  }

  /**
   * Clear all filter values
   */
  clearAllFilters(): void {
    if (this.isUpdating) {
      return; // Prevent infinite loop
    }

    // Clear immediately without debouncing to prevent race conditions
    this.isUpdating = true;
    try {
      this.filterValuesSubject.next([]);
      this.filterEventsSubject.next([]);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Update filter values (used when filters are set programmatically)
   */
  setFilterValues(filters: IFilterValues[]): void {
    if (this.isUpdating) {
      return; // Prevent infinite loop
    }

    this.debouncedUpdate(filters);
  }

  /**
   * Debounced update to prevent rapid successive updates
   */
  private debouncedUpdate(filters: IFilterValues[]): void {
    // Clear any pending timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    // Set a new timeout
    this.updateTimeout = setTimeout(() => {
      this.isUpdating = true;
      try {
        this.filterValuesSubject.next(filters);
      } finally {
        this.isUpdating = false;
      }
    }, 50); // 50ms debounce
  }

  /**
   * Get filters for a specific widget
   */
  getFiltersForWidget(widgetId: string): IFilterValues[] {
    return this.filterValuesSubject.value.filter(filter => 
      filter['widgetId'] === widgetId
    );
  }

  /**
   * Get filters by accessor type (also checks filterColumn)
   */
  getFiltersByAccessor(accessor: string): IFilterValues[] {
    return this.filterValuesSubject.value.filter(filter => 
      filter.accessor === accessor || filter.filterColumn === accessor
    );
  }

  /**
   * Check if a widget has any active filters
   */
  hasActiveFilters(widgetId: string): boolean {
    return this.getFiltersForWidget(widgetId).length > 0;
  }

  /**
   * Create filter value from chart click data
   */
  private createFilterValueFromClickData(clickedData: any): IFilterValues | null {
    if (!clickedData || typeof clickedData !== 'object') {
      return null;
    }

    let filterValue: IFilterValues = {
      accessor: 'unknown'
    };

    // For pie charts, use the name as the filter key
    if (clickedData.name) {
      filterValue = {
        accessor: 'category',
        category: clickedData.name,
        value: clickedData.value || clickedData.name
      };
    }
    // For bar charts or other series-based charts
    else if (clickedData.seriesName) {
      filterValue = {
        accessor: 'series',
        series: clickedData.seriesName,
        value: clickedData.value || clickedData.seriesName
      };
    }
    // For scatter plots
    else if (clickedData.value && Array.isArray(clickedData.value)) {
      filterValue = {
        accessor: 'coordinates',
        x: clickedData.value[0]?.toString(),
        y: clickedData.value[1]?.toString(),
        value: `(${clickedData.value[0]}, ${clickedData.value[1]})`
      };
    }
    // For other data types, try to find meaningful properties
    else {
      const keys = Object.keys(clickedData);
      if (keys.length > 0) {
        const key = keys[0];
        filterValue = {
          accessor: key,
          [key]: clickedData[key],
          value: clickedData[key]?.toString()
        };
      }
    }

    return filterValue.accessor !== 'unknown' ? filterValue : null;
  }

  /**
   * Check if two filters are the same
   */
  private isSameFilter(filter1: IFilterValues, filter2: IFilterValues): boolean {
    // Use JSON.stringify for reliable comparison of small objects
    return JSON.stringify(filter1) === JSON.stringify(filter2);
  }

  /**
   * Apply filters to data
   */
  applyFiltersToData<T>(data: T[], filters: IFilterValues[]): T[] {
    if (!filters || filters.length === 0) {
      return data;
    }

    return data.filter(item => {
      return filters.every(filter => {
        return this.matchesFilter(item, filter);
      });
    });
  }

  /**
   * Check if an item matches a filter
   */
  private matchesFilter(item: any, filter: IFilterValues): boolean {
    // Use filterColumn if available, otherwise fall back to accessor
    const filterKey = filter.filterColumn || filter.accessor;
    
    switch (filter.accessor) {
      case 'category':
        return item.name === filter['category'] || item.category === filter['category'];
      case 'series':
        return item.seriesName === filter['series'] || item.series === filter['series'];
      case 'coordinates':
        return item.value && 
               Array.isArray(item.value) && 
               item.value[0]?.toString() === filter['x'] && 
               item.value[1]?.toString() === filter['y'];
      default:
        // For custom accessors, check if the property exists and matches
        // Use filterColumn if available, otherwise use accessor
        const propertyToCheck = filter.filterColumn || filter.accessor;
        return item[propertyToCheck] === filter[filter.accessor] || 
               item[propertyToCheck]?.toString() === filter['value'];
    }
  }
} 