import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, map, share, tap } from 'rxjs';
import { NativeWebSocketService, NativeWebSocketConfig } from './native-websocket.service';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';

/**
 * Native WebSocket service for NSE Indices data
 * Modern implementation using browser native WebSocket API
 * No external dependencies required
 */
@Injectable({
  providedIn: 'root'
})
export class NativeIndicesWebSocketService {
  private readonly baseUrl = `ws://localhost:8080/ws/indices-native`; // Raw WebSocket endpoint
  private readonly config: NativeWebSocketConfig = {
    url: this.baseUrl,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    debug: false // Set to true for debugging
  };

  // Current data states
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  private specificIndicesData = new Map<string, BehaviorSubject<IndicesDto | null>>();
  
  // Active subscriptions tracking
  private activeSubscriptions = new Set<string>();

  constructor(private nativeWebSocketService: NativeWebSocketService) {}

  /**
   * Get connection state
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.nativeWebSocketService.connectionState;
  }

  /**
   * Get error observable
   */
  get errors(): Observable<string> {
    return this.nativeWebSocketService.errors;
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.nativeWebSocketService.isConnected;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve();
    }

    try {
      await this.nativeWebSocketService.connect(this.config);
      console.log('Connected to Indices WebSocket');
    } catch (error) {
      console.error('Failed to connect to Indices WebSocket:', error);
      throw error;
    }
  }

  /**
   * Subscribe to all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    return this.createSubscription('all-indices', {
      type: 'subscribe',
      topic: 'all-indices'
    });
  }

  /**
   * Subscribe to specific index data
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    const normalizedIndexName = indexName.toUpperCase().replace(/\s+/g, '-');
    return this.createSubscription(`index-${normalizedIndexName}`, {
      type: 'subscribe',
      topic: 'index',
      indexName: normalizedIndexName
    });
  }

  /**
   * Unsubscribe from all indices
   */
  unsubscribeFromAllIndices(): void {
    this.removeSubscription('all-indices', {
      type: 'unsubscribe',
      topic: 'all-indices'
    });
  }

  /**
   * Unsubscribe from specific index
   */
  unsubscribeFromIndex(indexName: string): void {
    const normalizedIndexName = indexName.toUpperCase().replace(/\s+/g, '-');
    this.removeSubscription(`index-${normalizedIndexName}`, {
      type: 'unsubscribe',
      topic: 'index',
      indexName: normalizedIndexName
    });
  }

  /**
   * Get current all indices data
   */
  getCurrentAllIndices(): IndicesDto | null {
    return this.allIndicesData$.value;
  }

  /**
   * Get current specific index data
   */
  getCurrentIndexData(indexName: string): IndicesDto | null {
    const normalizedIndexName = indexName.toUpperCase().replace(/\s+/g, '-');
    const dataSubject = this.specificIndicesData.get(`index-${normalizedIndexName}`);
    return dataSubject?.value || null;
  }

  /**
   * Disconnect from WebSocket
   */
  async disconnect(): Promise<void> {
    // Clear all subscriptions
    this.activeSubscriptions.clear();
    this.specificIndicesData.clear();
    this.allIndicesData$.next(null);
    
    // Disconnect WebSocket
    this.nativeWebSocketService.disconnect();
    console.log('Disconnected from Indices WebSocket');
  }

  /**
   * Create a subscription for indices data
   */
  private createSubscription(subscriptionKey: string, subscribeMessage: any): Observable<IndicesDto> {
    // Create or get data subject for this subscription
    let dataSubject: BehaviorSubject<IndicesDto | null>;
    
    if (subscriptionKey === 'all-indices') {
      dataSubject = this.allIndicesData$;
    } else {
      if (!this.specificIndicesData.has(subscriptionKey)) {
        this.specificIndicesData.set(subscriptionKey, new BehaviorSubject<IndicesDto | null>(null));
      }
      dataSubject = this.specificIndicesData.get(subscriptionKey)!;
    }

    // Connect if not already connected
    if (!this.isConnected) {
      this.connect().then(() => {
        this.sendSubscribeMessage(subscriptionKey, subscribeMessage);
      }).catch(error => {
        console.error('Connection failed during subscription:', error);
      });
    } else {
      this.sendSubscribeMessage(subscriptionKey, subscribeMessage);
    }

    // Return observable that filters null values
    return dataSubject.pipe(
      filter((data): data is IndicesDto => data !== null),
      share()
    );
  }

  /**
   * Send subscribe message and setup message listener
   */
  private sendSubscribeMessage(subscriptionKey: string, subscribeMessage: any): void {
    // Add to active subscriptions
    this.activeSubscriptions.add(subscriptionKey);
    
    // Send subscription message
    this.nativeWebSocketService.send(subscribeMessage);
    
    // Setup message listener if not already setup
    if (this.activeSubscriptions.size === 1) {
      this.setupMessageListener();
    }
    
    console.log(`Subscribed to: ${subscriptionKey}`);
  }

  /**
   * Remove subscription
   */
  private removeSubscription(subscriptionKey: string, unsubscribeMessage: any): void {
    // Remove from active subscriptions
    this.activeSubscriptions.delete(subscriptionKey);
    
    // Send unsubscribe message
    this.nativeWebSocketService.send(unsubscribeMessage);
    
    // Clear data
    if (subscriptionKey === 'all-indices') {
      this.allIndicesData$.next(null);
    } else {
      const dataSubject = this.specificIndicesData.get(subscriptionKey);
      if (dataSubject) {
        dataSubject.next(null);
        this.specificIndicesData.delete(subscriptionKey);
      }
    }
    
    console.log(`Unsubscribed from: ${subscriptionKey}`);
  }

  /**
   * Setup message listener for incoming data
   */
  private setupMessageListener(): void {
    this.nativeWebSocketService.subscribe<any>().pipe(
      filter(data => data !== null)
    ).subscribe({
      next: (data: any) => {
        this.handleIncomingMessage(data);
      },
      error: (error) => {
        console.error('WebSocket message error:', error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleIncomingMessage(data: any): void {
    try {
      // Check if this is indices data
      if (data.indices || data.type === 'indices') {
        const indicesData: IndicesDto = {
          timestamp: data.timestamp || new Date().toISOString(),
          indices: data.indices || [],
          marketStatus: data.marketStatus,
          source: 'WebSocket'
        };

        // Update all indices data if applicable
        if (data.topic === 'all-indices' || !data.indexName) {
          this.allIndicesData$.next(indicesData);
        }

        // Update specific index data if applicable
        if (data.indexName) {
          const subscriptionKey = `index-${data.indexName.toUpperCase()}`;
          const dataSubject = this.specificIndicesData.get(subscriptionKey);
          if (dataSubject) {
            dataSubject.next(indicesData);
          }
        }

        if (this.config.debug) {
          console.log('Processed indices data:', indicesData);
        }
      }
    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }
}