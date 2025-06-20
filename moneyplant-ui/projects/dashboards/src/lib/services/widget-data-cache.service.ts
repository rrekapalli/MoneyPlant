import { Injectable } from '@angular/core';
import { IWidget } from '../entities/IWidget';
import { IFilterValues } from '../entities/IFilterValues';

/**
 * Service for caching widget data to improve performance
 * 
 * This service provides methods for caching and retrieving widget data,
 * reducing the need for repeated data fetching.
 */
@Injectable({
  providedIn: 'root'
})
export class WidgetDataCacheService {
  private cache: Map<string, { data: any, timestamp: number, filters?: string }> = new Map();

  // Cache expiration time in milliseconds (default: 5 minutes)
  private cacheExpirationTime = 5 * 60 * 1000;

  constructor() {}

  /**
   * Sets the cache expiration time
   * 
   * @param timeInMs - The cache expiration time in milliseconds
   */
  setCacheExpirationTime(timeInMs: number): void {
    this.cacheExpirationTime = timeInMs;
  }

  /**
   * Gets the cache key for a widget and optional filters
   * 
   * @param widget - The widget to get the cache key for
   * @param filters - Optional filter values
   * @returns The cache key
   */
  private getCacheKey(widget: IWidget, filters?: string | IFilterValues[]): string {
    const widgetId = widget.id || '';
    const filterString = this.getFilterString(filters);
    return `${widgetId}:${filterString}`;
  }

  /**
   * Converts filters to a string for use in cache keys
   * 
   * @param filters - The filters to convert
   * @returns A string representation of the filters
   */
  private getFilterString(filters?: string | IFilterValues[]): string {
    if (!filters) {
      return '';
    }

    if (typeof filters === 'string') {
      return filters;
    }

    return JSON.stringify(filters);
  }

  /**
   * Gets data from the cache for a widget and filters
   * 
   * @param widget - The widget to get data for
   * @param filters - Optional filter values
   * @returns The cached data if available and not expired, undefined otherwise
   */
  getData(widget: IWidget, filters?: string | IFilterValues[]): any {
    const key = this.getCacheKey(widget, filters);
    const cachedItem = this.cache.get(key);

    if (!cachedItem) {
      return undefined;
    }

    // Check if the cache has expired
    const now = Date.now();
    if (now - cachedItem.timestamp > this.cacheExpirationTime) {
      this.cache.delete(key);
      return undefined;
    }

    return cachedItem.data;
  }

  /**
   * Stores data in the cache for a widget and filters
   * 
   * @param widget - The widget to store data for
   * @param data - The data to store
   * @param filters - Optional filter values
   */
  setData(widget: IWidget, data: any, filters?: string | IFilterValues[]): void {
    const key = this.getCacheKey(widget, filters);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      filters: this.getFilterString(filters)
    });
  }

  /**
   * Clears the cache for a specific widget
   * 
   * @param widget - The widget to clear the cache for
   */
  clearWidgetCache(widget: IWidget): void {
    const widgetId = widget.id || '';

    // Delete all cache entries for this widget
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${widgetId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Determines if a widget's data should be reloaded based on filter changes
   * 
   * @param widget - The widget to check
   * @param oldFilters - The old filter values
   * @param newFilters - The new filter values
   * @returns True if the widget should be reloaded, false otherwise
   */
  shouldReloadWidget(widget: IWidget, oldFilters: IFilterValues[], newFilters: IFilterValues[]): boolean {
    // If the widget doesn't support filtering, it doesn't need to be reloaded
    if (widget.config?.state?.supportsFiltering === false) {
      return false;
    }

    // If the widget has dependencies on specific filters, check if those have changed
    const dependencies = widget.config?.state?.filterDependencies;
    if (dependencies && Array.isArray(dependencies) && dependencies.length > 0) {
      // Check if any of the dependent filters have changed
      return dependencies.some(dep => {
        const oldFilter = oldFilters.find(f => f['id'] === dep);
        const newFilter = newFilters.find(f => f['id'] === dep);

        if (!oldFilter && !newFilter) {
          return false;
        }

        if (!oldFilter || !newFilter) {
          return true;
        }

        return JSON.stringify(oldFilter['value']) !== JSON.stringify(newFilter['value']);
      });
    }

    // By default, reload if any filter has changed
    if (oldFilters.length !== newFilters.length) {
      return true;
    }

    return JSON.stringify(oldFilters) !== JSON.stringify(newFilters);
  }
}
