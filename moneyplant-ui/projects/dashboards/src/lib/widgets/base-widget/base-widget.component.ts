import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IWidget } from '../../entities/IWidget';
import { EventBusService, EventType } from '../../services/event-bus.service';

/**
 * Base component for all widget types
 * 
 * This component provides common functionality for all widget types,
 * reducing code duplication and improving maintainability.
 */
@Component({
  template: '',
})
export abstract class BaseWidgetComponent implements OnInit, OnDestroy {
  /** The widget configuration */
  @Input() widget!: IWidget;
  
  /** Event emitted when data needs to be loaded for the widget */
  @Input() onDataLoad!: EventEmitter<IWidget>;
  
  /** Event emitted when filter values are updated */
  @Input() onUpdateFilter!: EventEmitter<any>;
  
  /** Subject for handling component destruction */
  protected destroy$ = new Subject<void>();
  
  /** Loading state of the widget */
  protected loading = false;
  
  /** Error state of the widget */
  protected error: any = null;
  
  constructor(protected eventBus: EventBusService) {}
  
  /**
   * Initializes the component
   */
  ngOnInit(): void {
    // Subscribe to relevant events
    this.subscribeToEvents();
  }
  
  /**
   * Cleans up resources when the component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Subscribes to relevant events from the event bus
   */
  protected subscribeToEvents(): void {
    // Subscribe to widget update events for this widget
    this.eventBus.onWidgetUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedWidget => {
        if (updatedWidget.id === this.widget.id) {
          this.widget = updatedWidget;
          this.onWidgetUpdated();
        }
      });
      
    // Subscribe to filter update events
    this.eventBus.onFilterUpdate()
      .pipe(takeUntil(this.destroy$))
      .subscribe(filterData => {
        this.onFilterUpdated(filterData);
      });
  }
  
  /**
   * Loads data for the widget
   */
  protected loadData(): void {
    this.loading = true;
    this.error = null;
    
    try {
      // Use the event bus to publish a data load event
      this.eventBus.publishDataLoad(this.widget, this.widget.id);
      
      // Also emit the legacy event for backward compatibility
      this.onDataLoad?.emit(this.widget);
    } catch (err) {
      this.handleError(err);
    }
  }
  
  /**
   * Handles errors that occur during data loading
   * 
   * @param error - The error that occurred
   */
  protected handleError(error: any): void {
    this.error = error;
    this.loading = false;
    this.eventBus.publishError(error, this.widget.id);
    console.error(`Error in widget ${this.widget.id}:`, error);
  }
  
  /**
   * Called when the widget is updated
   * Override in derived classes to handle widget updates
   */
  protected onWidgetUpdated(): void {
    // To be overridden by derived classes
  }
  
  /**
   * Called when filters are updated
   * Override in derived classes to handle filter updates
   * 
   * @param filterData - The updated filter data
   */
  protected onFilterUpdated(filterData: any): void {
    // To be overridden by derived classes
  }
  
  /**
   * Updates a filter value
   * 
   * @param value - The new filter value
   */
  protected updateFilter(value: any): void {
    const filterData = {
      value,
      widget: this.widget,
    };
    
    // Use the event bus to publish a filter update event
    this.eventBus.publishFilterUpdate(filterData, this.widget.id);
    
    // Also emit the legacy event for backward compatibility
    this.onUpdateFilter?.emit(filterData);
  }
}