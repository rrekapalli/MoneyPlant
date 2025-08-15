import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { BaseWebSocketService } from './base-websocket.service';
import { 
  IndicesDto, 
  IndexDataDto, 
  WebSocketConnectionState, 
  WebSocketSubscription,
  WebSocketServiceConfig
} from '../entities/indices-websocket';
import { environment } from '../../../environments/environment';

/**
 * Service for consuming NSE Indices WebSocket endpoints from engines project
 * Implements the endpoints exposed in engines project
 * Now connects to engines instead of backend
 */
@Injectable({
  providedIn: 'root'
})
export class IndicesWebSocketService {
  private readonly baseUrl = `${environment.enginesHttpUrl}/ws/nse-indices`;
  private readonly config: WebSocketServiceConfig = {
    brokerURL: this.baseUrl,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    reconnectDelay: 5000,
    debug: false // Set to true for debugging
  };

  // Observables for all indices data
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  
  // Map to store specific index data observables
  private specificIndicesData = new Map<string, BehaviorSubject<IndicesDto | null>>();
  
  // Active subscriptions tracking
  private activeSubscriptions = new Map<string, WebSocketSubscription>();

  constructor(private baseWebSocketService: BaseWebSocketService) {}

  /**
   * Get connection state
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.baseWebSocketService.connectionState;
  }

  /**
   * Get errors
   */
  get errors(): Observable<string> {
    return this.baseWebSocketService.errors;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.baseWebSocketService.isConnected;
  }

  /**
   * Connect to engines WebSocket
   */
  async connect(): Promise<void> {
    try {
      await this.baseWebSocketService.connect(this.config);
      console.log('Connected to engines indices WebSocket');
    } catch (error) {
      console.error('Failed to connect to engines indices WebSocket:', error);
      throw error;
    }
  }

  /**
   * Disconnect from engines WebSocket
   */
  disconnect(): void {
    this.baseWebSocketService.disconnect();
    this.clearSubscriptions();
  }

  /**
   * Subscribe to all indices data from engines
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    // Send subscription message to engines
    this.baseWebSocketService.publish('/app/subscribe-indices', {
      action: 'subscribe',
      channel: 'nse-indices'
    });

    // Return observable that filters messages for all indices
    return this.allIndicesData$.pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Subscribe to specific index data from engines
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    // Send subscription message to engines for specific index
    this.baseWebSocketService.publish('/app/subscribe-indices', {
      action: 'subscribe',
      channel: 'nse-indices',
      index: indexName
    });

    // Track this subscription
    if (!this.specificIndicesData.has(indexName)) {
      this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
    }

    // Return observable that filters messages for specific index
    return this.specificIndicesData.get(indexName)!.pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    this.baseWebSocketService.publish('/app/unsubscribe-indices', {
      action: 'unsubscribe',
      channel: 'nse-indices'
    });
    
    this.allIndicesData$.next(null);
  }

  /**
   * Unsubscribe from specific index data
   */
  unsubscribeFromIndex(indexName: string): void {
    this.baseWebSocketService.publish('/app/unsubscribe-indices', {
      action: 'unsubscribe',
      channel: 'nse-indices',
      index: indexName
    });
    
    // Clear specific index data cache
    if (this.specificIndicesData.has(indexName)) {
      this.specificIndicesData.get(indexName)?.next(null);
    }
  }

  /**
   * Get all indices data (cached)
   */
  getAllIndicesData(): Observable<IndicesDto | null> {
    return this.allIndicesData$.asObservable();
  }

  /**
   * Get specific index data (cached)
   */
  getIndexData(indexName: string): Observable<IndicesDto | null> {
    if (!this.specificIndicesData.has(indexName)) {
      this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
    }
    return this.specificIndicesData.get(indexName)!.asObservable();
  }

  /**
   * Check if subscribed to all indices
   */
  isSubscribedToAllIndices(): boolean {
    return this.allIndicesData$.value !== null;
  }

  /**
   * Check if subscribed to specific index
   */
  isSubscribedToIndex(indexName: string): boolean {
    return this.specificIndicesData.has(indexName) && 
           this.specificIndicesData.get(indexName)?.value !== null;
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): WebSocketSubscription[] {
    return Array.from(this.activeSubscriptions.values());
  }

  /**
   * Handle incoming WebSocket messages from engines
   */
  private handleIncomingMessage(data: any): void {
    try {
      // Check if this is indices data from engines
      if (data.indices || data.type === 'nse-indices') {
        const indicesData: IndicesDto = {
          timestamp: data.timestamp || new Date().toISOString(),
          indices: data.indices || [],
          marketStatus: data.marketStatus,
          source: 'Engines WebSocket'
        };

        // Update all indices data if applicable
        if (data.topic === 'all-indices' || !data.indexName) {
          this.allIndicesData$.next(indicesData);
        }

        // Update specific index data if applicable
        if (data.indexName) {
          const dataSubject = this.specificIndicesData.get(data.indexName);
          if (dataSubject) {
            dataSubject.next(indicesData);
          }
        }

        console.log('Processed indices data from engines:', indicesData);
      }
    } catch (error) {
      console.error('Error processing incoming message from engines:', error);
    }
  }

  /**
   * Clear all subscriptions
   */
  private clearSubscriptions(): void {
    this.activeSubscriptions.clear();
    this.allIndicesData$.next(null);
    this.specificIndicesData.forEach(subject => subject.next(null));
  }
}