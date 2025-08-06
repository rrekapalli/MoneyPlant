import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Client, IMessage, StompConfig, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';
import { environment } from '../../../environments/environment';

/**
 * Modern STOMP WebSocket service
 * Uses @stomp/stompjs with native WebSocket
 * Compatible with Spring Boot STOMP endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class StompNativeWebSocketService {
  private client: Client;
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private errors$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Data caching
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  private specificIndicesData = new Map<string, BehaviorSubject<IndicesDto | null>>();
  
  // Active subscriptions
  private activeSubscriptions = new Map<string, any>();

  constructor() {
    this.client = this.createStompClient();
  }

  /**
   * Create and configure STOMP client
   */
  private createStompClient(): Client {
    const client = new Client({
      webSocketFactory: () => {
        const baseUrl = environment.production ?
          `${environment.apiUrl}/ws/indices` :
          `${environment.apiUrl}/ws/indices`;
        return new SockJS(baseUrl);
      },
      debug: (msg) => {
        // Debug logging disabled for production
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Set up connection callbacks
    client.onConnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.CONNECTED);
    };

    client.onDisconnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.clearSubscriptions();
    };

    client.onStompError = (frame: IFrame) => {
      console.error('STOMP Error:', frame);
      this.errors$.next(`STOMP Error: ${frame.headers['message']}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    };

    client.onWebSocketError = (error: any) => {
      console.error('WebSocket Error:', error);
      this.errors$.next(`WebSocket Error: ${error.message || error}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    };

    client.onWebSocketClose = (event: CloseEvent) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
    };

    return client;
  }

  /**
   * Get connection state observable
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Get errors observable
   */
  get errors(): Observable<string> {
    return this.errors$.asObservable();
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.client.connected;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    try {
      this.connectionState$.next(WebSocketConnectionState.CONNECTING);
      
      this.client.activate();
      
      // Wait for connection with timeout
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000); // 10 second timeout

        const subscription = this.connectionState$.subscribe(state => {
          if (state === WebSocketConnectionState.CONNECTED) {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve();
          } else if (state === WebSocketConnectionState.ERROR) {
            clearTimeout(timeout);
            subscription.unsubscribe();
            reject(new Error('Connection failed'));
          }
        });
      });
    } catch (error) {
      console.error('Failed to connect to STOMP WebSocket:', error);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    try {
      this.clearSubscriptions();
      await this.client.deactivate();
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  /**
   * Subscribe to all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    const destination = '/topic/indices';
    
    if (!this.client.connected) {
      console.warn('Client not connected, cannot subscribe to all indices');
      return this.allIndicesData$.asObservable().pipe(
        filter((data): data is IndicesDto => data !== null)
      );
    }

    // Check if already subscribed
    if (this.activeSubscriptions.has(destination)) {
      return this.allIndicesData$.asObservable().pipe(
        filter((data): data is IndicesDto => data !== null)
      );
    }
    
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const indicesData: IndicesDto = JSON.parse(message.body);
        this.allIndicesData$.next(indicesData);
      } catch (error) {
        console.error('Error parsing indices data:', error);
        this.errors$.next(`Failed to parse indices data: ${error}`);
      }
    });

    this.activeSubscriptions.set(destination, subscription);
    
    // Send subscription message to backend to trigger NSE connection
    this.client.publish({
      destination: '/app/subscribe-indices',
      body: JSON.stringify({ action: 'subscribe' })
    });

    return this.allIndicesData$.asObservable().pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Subscribe to specific index data
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    const destination = `/topic/indices/${indexName}`;
    
    if (!this.client.connected) {
      console.warn(`Client not connected, cannot subscribe to index: ${indexName}`);
      
      // Return cached data or create new subject
      if (!this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
      }
      return this.specificIndicesData.get(indexName)!.asObservable().pipe(
        filter((data): data is IndicesDto => data !== null)
      );
    }

    // Check if already subscribed
    if (this.activeSubscriptions.has(destination)) {
      const existingSubject = this.specificIndicesData.get(indexName);
      if (existingSubject) {
        return existingSubject.asObservable().pipe(
          filter((data): data is IndicesDto => data !== null)
        );
      }
    }
    
    // Create data subject if it doesn't exist
    if (!this.specificIndicesData.has(indexName)) {
      this.specificIndicesData.set(indexName, new BehaviorSubject<IndicesDto | null>(null));
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const indicesData: IndicesDto = JSON.parse(message.body);
        this.specificIndicesData.get(indexName)?.next(indicesData);
      } catch (error) {
        console.error(`Error parsing data for index ${indexName}:`, error);
        this.errors$.next(`Failed to parse data for index ${indexName}: ${error}`);
      }
    });

    this.activeSubscriptions.set(destination, subscription);
    
    // Send subscription message to backend to trigger NSE connection
    this.client.publish({
      destination: `/app/subscribe-indices/${indexName}`,
      body: JSON.stringify({ indexName })
    });

    return this.specificIndicesData.get(indexName)!.asObservable().pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Unsubscribe from all indices
   */
  unsubscribeFromAllIndices(): void {
    const destination = '/topic/indices';
    this.unsubscribeFromDestination(destination);
    
    // Send unsubscribe message to backend
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/unsubscribe-indices',
        body: JSON.stringify({ action: 'unsubscribe' })
      });
    }
  }

  /**
   * Unsubscribe from specific index
   */
  unsubscribeFromIndex(indexName: string): void {
    const destination = `/topic/indices/${indexName}`;
    this.unsubscribeFromDestination(destination);
    
    // Send unsubscribe message to backend
    if (this.client.connected) {
      this.client.publish({
        destination: `/app/unsubscribe-indices/${indexName}`,
        body: JSON.stringify({ action: 'unsubscribe', indexName })
      });
    }
  }

  /**
   * Unsubscribe from a specific destination
   */
  private unsubscribeFromDestination(destination: string): void {
    const subscription = this.activeSubscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete(destination);
    }
  }

  /**
   * Clear all subscriptions
   */
  private clearSubscriptions(): void {
    this.activeSubscriptions.forEach((subscription, destination) => {
      subscription.unsubscribe();
    });
    this.activeSubscriptions.clear();
  }

  /**
   * Cleanup on service destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}