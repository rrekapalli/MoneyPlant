import { Injectable } from '@angular/core';
import { IWidget } from '../entities/IWidget';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for implementing virtual scrolling for large dashboards
 * 
 * This service provides methods for determining which widgets should be
 * rendered based on their position and the current viewport.
 */
@Injectable({
  providedIn: 'root'
})
export class VirtualScrollService {
  // Default viewport height in rows
  private viewportHeight = 20;

  // Buffer size in rows (widgets this many rows outside the viewport will still be rendered)
  private bufferSize = 5;

  // Scroll position in rows
  private scrollPosition = 0;

  // Observable for scroll position changes
  private scrollPositionSubject = new BehaviorSubject<number>(0);
  public scrollPosition$ = this.scrollPositionSubject.asObservable();

  // Observable for visible widgets
  private visibleWidgetsSubject = new BehaviorSubject<IWidget[]>([]);
  public visibleWidgets$ = this.visibleWidgetsSubject.asObservable();

  // Cache of widget positions for faster lookup
  private widgetPositionCache = new Map<string, { top: number, bottom: number }>();

  constructor() {}

  /**
   * Sets the viewport height
   * 
   * @param rows - The viewport height in rows
   */
  setViewportHeight(rows: number): void {
    this.viewportHeight = rows;
  }

  /**
   * Sets the buffer size
   * 
   * @param rows - The buffer size in rows
   */
  setBufferSize(rows: number): void {
    this.bufferSize = rows;
  }

  /**
   * Updates the scroll position and recalculates visible widgets
   * 
   * @param scrollTop - The new scroll position in rows
   * @param widgets - All widgets in the dashboard
   */
  updateScrollPosition(scrollTop: number, widgets: IWidget[]): void {
    this.scrollPosition = scrollTop;
    this.scrollPositionSubject.next(scrollTop);

    // Update visible widgets
    const visibleWidgets = this.getVisibleWidgets(widgets, scrollTop);
    this.visibleWidgetsSubject.next(visibleWidgets);
  }

  /**
   * Gets the current scroll position
   * 
   * @returns The current scroll position in rows
   */
  getScrollPosition(): number {
    return this.scrollPosition;
  }

  /**
   * Gets an observable of the scroll position
   * 
   * @returns An observable of the scroll position
   */
  getScrollPosition$(): Observable<number> {
    return this.scrollPosition$;
  }

  /**
   * Gets an observable of the visible widgets
   * 
   * @returns An observable of the visible widgets
   */
  getVisibleWidgets$(): Observable<IWidget[]> {
    return this.visibleWidgets$;
  }

  /**
   * Determines which widgets should be rendered based on the current scroll position
   * 
   * @param widgets - All widgets in the dashboard
   * @param scrollTop - The current scroll position in rows
   * @returns The widgets that should be rendered
   */
  getVisibleWidgets(widgets: IWidget[], scrollTop: number): IWidget[] {
    if (!widgets || widgets.length === 0) {
      return [];
    }

    // Calculate the visible range with buffer
    const visibleRangeStart = Math.max(0, scrollTop - this.bufferSize);
    const visibleRangeEnd = scrollTop + this.viewportHeight + this.bufferSize;

    // Update widget position cache if needed
    this.updateWidgetPositionCache(widgets);

    // Filter widgets to only include those in the visible range
    return widgets.filter(widget => {
      if (!widget.position) {
        return true; // Include widgets without position info
      }

      // Get widget position from cache if available
      const widgetId = widget.id || '';
      let widgetTop: number;
      let widgetBottom: number;

      if (this.widgetPositionCache.has(widgetId)) {
        const cachedPosition = this.widgetPositionCache.get(widgetId)!;
        widgetTop = cachedPosition.top;
        widgetBottom = cachedPosition.bottom;
      } else {
        // Calculate position if not in cache
        widgetTop = widget.position.y;
        widgetBottom = widget.position.y + widget.position.rows;

        // Add to cache
        this.widgetPositionCache.set(widgetId, { top: widgetTop, bottom: widgetBottom });
      }

      // Widget is visible if any part of it is in the visible range
      return (
        (widgetTop >= visibleRangeStart && widgetTop <= visibleRangeEnd) || // Top edge in range
        (widgetBottom >= visibleRangeStart && widgetBottom <= visibleRangeEnd) || // Bottom edge in range
        (widgetTop <= visibleRangeStart && widgetBottom >= visibleRangeEnd) // Widget spans the entire range
      );
    });
  }

  /**
   * Calculates the total height of the dashboard in rows
   * 
   * @param widgets - All widgets in the dashboard
   * @returns The total height in rows
   */
  getTotalHeight(widgets: IWidget[]): number {
    if (!widgets || widgets.length === 0) {
      return 0;
    }

    // Find the widget with the highest bottom edge
    return widgets.reduce((maxBottom, widget) => {
      if (!widget.position) {
        return maxBottom;
      }

      const bottom = widget.position.y + widget.position.rows;
      return Math.max(maxBottom, bottom);
    }, 0);
  }

  /**
   * Updates the widget position cache
   * 
   * @param widgets - All widgets in the dashboard
   */
  private updateWidgetPositionCache(widgets: IWidget[]): void {
    // Create a set of current widget IDs
    const currentWidgetIds = new Set<string>();

    // Update cache for each widget
    widgets.forEach(widget => {
      if (widget.id && widget.position) {
        const widgetId = widget.id;
        currentWidgetIds.add(widgetId);

        // Only update cache if position has changed or is not in cache
        const cachedPosition = this.widgetPositionCache.get(widgetId);
        const currentTop = widget.position.y;
        const currentBottom = widget.position.y + widget.position.rows;

        if (!cachedPosition || 
            cachedPosition.top !== currentTop || 
            cachedPosition.bottom !== currentBottom) {
          this.widgetPositionCache.set(widgetId, {
            top: currentTop,
            bottom: currentBottom
          });
        }
      }
    });

    // Remove cache entries for widgets that no longer exist
    for (const cachedId of this.widgetPositionCache.keys()) {
      if (!currentWidgetIds.has(cachedId)) {
        this.widgetPositionCache.delete(cachedId);
      }
    }
  }

  /**
   * Creates placeholder widgets for the virtual scroll
   * 
   * @param totalHeight - The total height of the dashboard in rows
   * @returns A placeholder widget that takes up the required space
   */
  createPlaceholders(totalHeight: number): IWidget {
    return {
      id: 'virtual-scroll-placeholder',
      position: {
        x: 0,
        y: 0,
        cols: 12,
        rows: totalHeight
      },
      config: {
        component: 'placeholder',
        header: {
          title: 'Virtual Scroll Placeholder'
        },
        options: {}
      }
    };
  }
}
