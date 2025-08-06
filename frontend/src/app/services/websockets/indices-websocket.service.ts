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

/**
 * Service for consuming NSE Indices WebSocket endpoints
 * Implements the endpoints exposed in IndicesController.java
 */
@Injectable({
  providedIn: 'root'
})
export class IndicesWebSocketService {
  private readonly baseUrl = '/ws/indices';
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
   * Get connection errors
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
   * Connect to indices WebSocket
   */
  async connect(): Promise<void> {
    try {
      await this.baseWebSocketService.connect(this.config);
      console.log('Connected to indices WebSocket service');
    } catch (error) {
      console.error('Failed to connect to indices WebSocket:', error);
      throw error;
    }
  }

  /**
   * Disconnect from indices WebSocket
   */
  async disconnect(): Promise<void> {
    // Unsubscribe from all active subscriptions
    this.unsubscribeFromAllIndices();
    this.unsubscribeFromAllSpecificIndices();
    
    await this.baseWebSocketService.disconnect();
    console.log('Disconnected from indices WebSocket service');
  }

  /**
   * Subscribe to all indices data
   * Endpoint: /topic/indices
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    const destination = '/topic/indices';
    
    if (!this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    // Check if already subscribed
    const existingSubscription = this.activeSubscriptions.get('ALL_INDICES');
    if (existingSubscription?.isActive) {
      return this.allIndicesData$.asObservable().pipe(
        filter(data => data !== null),
        map(data => data!)
      );
    }

    const subscriptionId = this.baseWebSocketService.subscribe<IndicesDto>(
      destination,
      (data: IndicesDto) => {
        console.log('Received all indices data:', data);
        this.allIndicesData$.next(data);
        
        // Update subscription with last message
        const subscription = this.activeSubscriptions.get('ALL_INDICES');
        if (subscription) {
          subscription.lastMessage = data;
        }
      }
    );

    // Track subscription
    const subscription: WebSocketSubscription = {
      id: subscriptionId,
      config: {
        endpoint: this.baseUrl,
        destination,
        autoReconnect: true
      },
      isActive: true,
      subscriptionTime: new Date()
    };
    
    this.activeSubscriptions.set('ALL_INDICES', subscription);
    console.log('Subscribed to all indices data');

    return this.allIndicesData$.asObservable().pipe(
      filter(data => data !== null),
      map(data => data!)
    );
  }

  /**
   * Subscribe to specific index data
   * Endpoint: /topic/indices/{indexName}
   * @param indexName The name of the index (e.g., "NIFTY-50", "SENSEX")
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    const normalizedIndexName = indexName.replace(' ', '-').toUpperCase();
    const destination = `/topic/indices/${normalizedIndexName.toLowerCase()}`;
    const subscriptionKey = `INDEX_${normalizedIndexName}`;
    
    if (!this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    // Check if already subscribed to this index
    const existingSubscription = this.activeSubscriptions.get(subscriptionKey);
    if (existingSubscription?.isActive) {
      const existingObservable = this.specificIndicesData.get(normalizedIndexName);
      if (existingObservable) {
        return existingObservable.asObservable().pipe(
          filter(data => data !== null),
          map(data => data!)
        );
      }
    }

    // Create observable for this specific index if not exists
    if (!this.specificIndicesData.has(normalizedIndexName)) {
      this.specificIndicesData.set(normalizedIndexName, new BehaviorSubject<IndicesDto | null>(null));
    }

    const indexObservable = this.specificIndicesData.get(normalizedIndexName)!;

    const subscriptionId = this.baseWebSocketService.subscribe<IndicesDto>(
      destination,
      (data: IndicesDto) => {
        console.log(`Received ${indexName} data:`, data);
        indexObservable.next(data);
        
        // Update subscription with last message
        const subscription = this.activeSubscriptions.get(subscriptionKey);
        if (subscription) {
          subscription.lastMessage = data;
        }
      }
    );

    // Track subscription
    const subscription: WebSocketSubscription = {
      id: subscriptionId,
      config: {
        endpoint: this.baseUrl,
        destination,
        indexName: normalizedIndexName,
        autoReconnect: true
      },
      isActive: true,
      subscriptionTime: new Date()
    };
    
    this.activeSubscriptions.set(subscriptionKey, subscription);
    console.log(`Subscribed to ${indexName} data`);

    return indexObservable.asObservable().pipe(
      filter(data => data !== null),
      map(data => data!)
    );
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    const subscription = this.activeSubscriptions.get('ALL_INDICES');
    if (subscription?.isActive) {
      this.baseWebSocketService.unsubscribe(subscription.id);
      
      // Send unsubscribe message to backend
      if (this.isConnected) {
        this.baseWebSocketService.send('/app/unsubscribe-indices');
      }
      
      subscription.isActive = false;
      this.activeSubscriptions.delete('ALL_INDICES');
      this.allIndicesData$.next(null);
      
      console.log('Unsubscribed from all indices data');
    }
  }

  /**
   * Unsubscribe from specific index data
   * @param indexName The name of the index to unsubscribe from
   */
  unsubscribeFromIndex(indexName: string): void {
    const normalizedIndexName = indexName.replace(' ', '-').toUpperCase();
    const subscriptionKey = `INDEX_${normalizedIndexName}`;
    
    const subscription = this.activeSubscriptions.get(subscriptionKey);
    if (subscription?.isActive) {
      this.baseWebSocketService.unsubscribe(subscription.id);
      
      // Send unsubscribe message to backend
      if (this.isConnected) {
        const unsubscribeDestination = `/app/unsubscribe-indices/${normalizedIndexName.toLowerCase()}`;
        this.baseWebSocketService.send(unsubscribeDestination);
      }
      
      subscription.isActive = false;
      this.activeSubscriptions.delete(subscriptionKey);
      
      // Clear the observable
      const indexObservable = this.specificIndicesData.get(normalizedIndexName);
      if (indexObservable) {
        indexObservable.next(null);
      }
      
      console.log(`Unsubscribed from ${indexName} data`);
    }
  }

  /**
   * Unsubscribe from all specific indices
   */
  unsubscribeFromAllSpecificIndices(): void {
    const specificSubscriptions = Array.from(this.activeSubscriptions.entries())
      .filter(([key]) => key.startsWith('INDEX_'));
    
    specificSubscriptions.forEach(([key, subscription]) => {
      if (subscription.isActive && subscription.config.indexName) {
        this.unsubscribeFromIndex(subscription.config.indexName);
      }
    });
  }

  /**
   * Get current all indices data (latest received)
   */
  getCurrentAllIndicesData(): IndicesDto | null {
    return this.allIndicesData$.value;
  }

  /**
   * Get current specific index data (latest received)
   * @param indexName The name of the index
   */
  getCurrentIndexData(indexName: string): IndicesDto | null {
    const normalizedIndexName = indexName.replace(' ', '-').toUpperCase();
    const indexObservable = this.specificIndicesData.get(normalizedIndexName);
    return indexObservable?.value || null;
  }

  /**
   * Get list of active subscriptions
   */
  getActiveSubscriptions(): WebSocketSubscription[] {
    return Array.from(this.activeSubscriptions.values()).filter(sub => sub.isActive);
  }

  /**
   * Check if subscribed to all indices
   */
  isSubscribedToAllIndices(): boolean {
    const subscription = this.activeSubscriptions.get('ALL_INDICES');
    return subscription?.isActive === true;
  }

  /**
   * Check if subscribed to specific index
   * @param indexName The name of the index
   */
  isSubscribedToIndex(indexName: string): boolean {
    const normalizedIndexName = indexName.replace(' ', '-').toUpperCase();
    const subscriptionKey = `INDEX_${normalizedIndexName}`;
    const subscription = this.activeSubscriptions.get(subscriptionKey);
    return subscription?.isActive === true;
  }

  /**
   * Get observable for specific index by name
   * @param indexName The name of the index
   */
  getIndexObservable(indexName: string): Observable<IndicesDto> | null {
    const normalizedIndexName = indexName.replace(' ', '-').toUpperCase();
    const indexObservable = this.specificIndicesData.get(normalizedIndexName);
    
    if (indexObservable) {
      return indexObservable.asObservable().pipe(
        filter(data => data !== null),
        map(data => data!)
      );
    }
    
    return null;
  }

  /**
   * Enable debug mode
   */
  enableDebug(): void {
    this.config.debug = true;
  }

  /**
   * Disable debug mode
   */
  disableDebug(): void {
    this.config.debug = false;
  }
}