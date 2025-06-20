import { Injectable } from '@angular/core';
import { IWidget } from '../entities/IWidget';

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
    
    // Filter widgets to only include those in the visible range
    return widgets.filter(widget => {
      if (!widget.position) {
        return true; // Include widgets without position info
      }
      
      const widgetTop = widget.position.y;
      const widgetBottom = widget.position.y + widget.position.rows;
      
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