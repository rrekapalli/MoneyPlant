import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IWidget } from '../entities/IWidget';

/**
 * Event types supported by the event bus
 */
export enum EventType {
  DATA_LOAD = 'DATA_LOAD',
  FILTER_UPDATE = 'FILTER_UPDATE',
  WIDGET_UPDATE = 'WIDGET_UPDATE',
  DASHBOARD_CHANGE = 'DASHBOARD_CHANGE',
  WIDGET_RESIZE = 'WIDGET_RESIZE',
  WIDGET_MOVE = 'WIDGET_MOVE',
  ERROR = 'ERROR'
}

/**
 * Interface for events published through the event bus
 */
export interface Event {
  type: EventType;
  payload: any;
  source?: string;
  timestamp?: number;
}

/**
 * Service for handling events in the dashboard framework
 * 
 * This service provides a decoupled approach for communication between components
 * using a publish-subscribe pattern.
 */
@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<Event>();
  
  /**
   * Publishes an event to the event bus
   * 
   * @param type - The type of event
   * @param payload - The event payload
   * @param source - Optional source identifier
   */
  publish(type: EventType, payload: any, source?: string): void {
    this.eventSubject.next({
      type,
      payload,
      source,
      timestamp: Date.now()
    });
  }
  
  /**
   * Subscribes to events of a specific type
   * 
   * @param type - The type of events to subscribe to
   * @returns An observable of events of the specified type
   */
  on(type: EventType): Observable<Event> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.type === type)
    );
  }
  
  /**
   * Subscribes to all events
   * 
   * @returns An observable of all events
   */
  onAll(): Observable<Event> {
    return this.eventSubject.asObservable();
  }
  
  /**
   * Publishes a data load event
   * 
   * @param widget - The widget that needs data
   * @param source - Optional source identifier
   */
  publishDataLoad(widget: IWidget, source?: string): void {
    this.publish(EventType.DATA_LOAD, widget, source);
  }
  
  /**
   * Subscribes to data load events
   * 
   * @returns An observable of data load events
   */
  onDataLoad(): Observable<IWidget> {
    return this.on(EventType.DATA_LOAD).pipe(
      map(event => event.payload as IWidget)
    );
  }
  
  /**
   * Publishes a filter update event
   * 
   * @param filterData - The updated filter data
   * @param source - Optional source identifier
   */
  publishFilterUpdate(filterData: any, source?: string): void {
    this.publish(EventType.FILTER_UPDATE, filterData, source);
  }
  
  /**
   * Subscribes to filter update events
   * 
   * @returns An observable of filter update events
   */
  onFilterUpdate(): Observable<any> {
    return this.on(EventType.FILTER_UPDATE).pipe(
      map(event => event.payload)
    );
  }
  
  /**
   * Publishes a widget update event
   * 
   * @param widget - The updated widget
   * @param source - Optional source identifier
   */
  publishWidgetUpdate(widget: IWidget, source?: string): void {
    this.publish(EventType.WIDGET_UPDATE, widget, source);
  }
  
  /**
   * Subscribes to widget update events
   * 
   * @returns An observable of widget update events
   */
  onWidgetUpdate(): Observable<IWidget> {
    return this.on(EventType.WIDGET_UPDATE).pipe(
      map(event => event.payload as IWidget)
    );
  }
  
  /**
   * Publishes an error event
   * 
   * @param error - The error that occurred
   * @param source - Optional source identifier
   */
  publishError(error: any, source?: string): void {
    this.publish(EventType.ERROR, error, source);
  }
  
  /**
   * Subscribes to error events
   * 
   * @returns An observable of error events
   */
  onError(): Observable<any> {
    return this.on(EventType.ERROR).pipe(
      map(event => event.payload)
    );
  }
}