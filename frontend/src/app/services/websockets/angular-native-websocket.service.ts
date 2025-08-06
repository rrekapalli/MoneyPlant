import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, filter, map, tap, retry, delay, takeUntil, share } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';

export interface AngularWebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

/**
 * Modern Angular v20 native WebSocket service using RxJS WebSocketSubject
 * No external dependencies - uses Angular/RxJS built-in WebSocket capabilities
 */
@Injectable({
  providedIn: 'root'
})
export class AngularNativeWebSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private messages$ = new Subject<any>();
  private errors$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private config: AngularWebSocketConfig | null = null;

  // Subscription tracking
  private activeSubscriptions = new Set<string>();
  
  // Data caching
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  private specificIndicesData = new Map<string, BehaviorSubject<IndicesDto | null>>();

  /**
   * Get connection state observable
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Get error observable
   */
  get errors(): Observable<string> {
    return this.errors$.asObservable();
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.socket$ !== null && !this.socket$.closed;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(config: AngularWebSocketConfig): Promise<void> {
    this.config = config;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectInterval = config.reconnectInterval || 3000;

    if (this.isConnected) {
      if (config.debug) {
        console.log('WebSocket already connected');
      }
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionState$.next(WebSocketConnectionState.CONNECTING);
        
        if (config.debug) {
          console.log('Connecting to WebSocket:', config.url);
        }

        // Create WebSocket connection using RxJS WebSocketSubject
        this.socket$ = webSocket({
          url: config.url,
          openObserver: {
            next: () => {
              this.connectionState$.next(WebSocketConnectionState.CONNECTED);
              this.reconnectAttempts = 0;
              if (config.debug) {
                console.log('WebSocket connected successfully');
              }
              resolve();
            }
          },
          closeObserver: {
            next: (closeEvent) => {
              this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
              if (config.debug) {
                console.log('WebSocket disconnected:', closeEvent);
              }
              this.handleReconnection();
            }
          }
        });

        // Subscribe to messages
        this.socket$.pipe(
          takeUntil(this.destroy$),
          retry({
            count: this.maxReconnectAttempts,
            delay: this.reconnectInterval
          }),
          catchError((error) => {
            const errorMsg = `WebSocket error: ${error.message || error}`;
            console.error(errorMsg);
            this.errors$.next(errorMsg);
            this.connectionState$.next(WebSocketConnectionState.ERROR);
            reject(error);
            return [];
          })
        ).subscribe({
          next: (message) => {
            this.handleIncomingMessage(message);
          },
          error: (error) => {
            const errorMsg = `WebSocket subscription error: ${error.message || error}`;
            console.error(errorMsg);
            this.errors$.next(errorMsg);
            this.connectionState$.next(WebSocketConnectionState.ERROR);
            reject(error);
          }
        });

      } catch (error) {
        const errorMsg = `Failed to create WebSocket connection: ${error}`;
        console.error(errorMsg);
        this.errors$.next(errorMsg);
        this.connectionState$.next(WebSocketConnectionState.ERROR);
        reject(error);
      }
    });
  }

  /**
   * Send message to WebSocket server
   */
  send(message: any): void {
    if (this.isConnected && this.socket$) {
      try {
        this.socket$.next(message);
        if (this.config?.debug) {
          console.log('WebSocket message sent:', message);
        }
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        this.errors$.next(`Failed to send message: ${error}`);
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
      this.errors$.next('WebSocket is not connected');
    }
  }

  /**
   * Subscribe to all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    const subscriptionKey = 'all-indices';
    this.activeSubscriptions.add(subscriptionKey);

    // Send subscription message
    this.send({
      type: 'subscribe',
      destination: '/topic/indices'
    });

    if (this.config?.debug) {
      console.log('Subscribed to all indices');
    }

    return this.allIndicesData$.pipe(
      filter((data): data is IndicesDto => data !== null),
      share()
    );
  }

  /**
   * Subscribe to specific index data
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    const normalizedIndexName = indexName.toUpperCase().replace(/\s+/g, '-');
    const subscriptionKey = `index-${normalizedIndexName}`;
    
    this.activeSubscriptions.add(subscriptionKey);

    // Create data subject if it doesn't exist
    if (!this.specificIndicesData.has(subscriptionKey)) {
      this.specificIndicesData.set(subscriptionKey, new BehaviorSubject<IndicesDto | null>(null));
    }

    // Send subscription message
    this.send({
      type: 'subscribe',
      destination: `/topic/indices/${normalizedIndexName}`
    });

    if (this.config?.debug) {
      console.log(`Subscribed to index: ${normalizedIndexName}`);
    }

    const dataSubject = this.specificIndicesData.get(subscriptionKey)!;
    return dataSubject.pipe(
      filter((data): data is IndicesDto => data !== null),
      share()
    );
  }

  /**
   * Unsubscribe from all indices
   */
  unsubscribeFromAllIndices(): void {
    this.activeSubscriptions.delete('all-indices');
    this.allIndicesData$.next(null);

    this.send({
      type: 'unsubscribe',
      destination: '/topic/indices'
    });

    if (this.config?.debug) {
      console.log('Unsubscribed from all indices');
    }
  }

  /**
   * Unsubscribe from specific index
   */
  unsubscribeFromIndex(indexName: string): void {
    const normalizedIndexName = indexName.toUpperCase().replace(/\s+/g, '-');
    const subscriptionKey = `index-${normalizedIndexName}`;
    
    this.activeSubscriptions.delete(subscriptionKey);
    
    const dataSubject = this.specificIndicesData.get(subscriptionKey);
    if (dataSubject) {
      dataSubject.next(null);
      this.specificIndicesData.delete(subscriptionKey);
    }

    this.send({
      type: 'unsubscribe',
      destination: `/topic/indices/${normalizedIndexName}`
    });

    if (this.config?.debug) {
      console.log(`Unsubscribed from index: ${normalizedIndexName}`);
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.activeSubscriptions.clear();
    this.specificIndicesData.clear();
    this.allIndicesData$.next(null);

    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
    
    if (this.config?.debug) {
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleIncomingMessage(message: any): void {
    try {
      if (this.config?.debug) {
        console.log('Received WebSocket message:', message);
      }

      // Check if this is indices data
      if (message.indices || message.type === 'indices') {
        const indicesData: IndicesDto = {
          timestamp: message.timestamp || new Date().toISOString(),
          indices: message.indices || [],
          marketStatus: message.marketStatus,
          source: 'WebSocket'
        };

        // Update all indices data if applicable
        if (message.destination === '/topic/indices' || !message.indexName) {
          this.allIndicesData$.next(indicesData);
        }

        // Update specific index data if applicable
        if (message.indexName) {
          const subscriptionKey = `index-${message.indexName.toUpperCase()}`;
          const dataSubject = this.specificIndicesData.get(subscriptionKey);
          if (dataSubject) {
            dataSubject.next(indicesData);
          }
        }
      }

      // Emit to general message stream
      this.messages$.next(message);

    } catch (error) {
      console.error('Error processing incoming message:', error);
      this.errors$.next(`Failed to process message: ${error}`);
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.errors$.next('Max reconnection attempts reached');
      return;
    }

    if (this.activeSubscriptions.size > 0) {
      this.reconnectAttempts++;
      this.connectionState$.next(WebSocketConnectionState.RECONNECTING);
      
      setTimeout(() => {
        if (this.config) {
          console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          this.connect(this.config).catch(error => {
            console.error('Reconnection failed:', error);
          });
        }
      }, this.reconnectInterval);
    }
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}