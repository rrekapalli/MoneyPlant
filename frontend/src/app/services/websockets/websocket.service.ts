import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { Client, IMessage, StompConfig, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';
import { environment } from '../../../environments/environment';

/**
 * Single, consolidated WebSocket service for all WebSocket operations
 * Handles STOMP connections, data management, and automatic tile updates
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  
  // STOMP client
  private client: Client;
  
  // Connection state management
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private errors$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Data management using BehaviorSubjects
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  private specificIndicesData = new Map<string, BehaviorSubject<any>>();
  
  // Active subscriptions
  private activeSubscriptions = new Map<string, any>();
  
  // Connection state tracking
  private isConnected: boolean = false;

  constructor() {
    this.client = this.createStompClient();
  }

  /**
   * Create and configure STOMP client
   */
  private createStompClient(): Client {
    const client = new Client({
      webSocketFactory: () => {
        const baseUrl = environment.enginesHttpUrl + '/ws/nse-indices';
        return new SockJS(baseUrl);
      },
      debug: () => {
        // Debug logging disabled for production
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Set up connection callbacks
    client.onConnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.CONNECTED);
      this.isConnected = true;
    };

    client.onDisconnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.isConnected = false;
      this.clearSubscriptions();
    };

    client.onStompError = (frame: IFrame) => {
      this.errors$.next(`STOMP Error: ${frame.headers['message']}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
      this.isConnected = false;
    };

    client.onWebSocketError = (error: any) => {
      this.errors$.next(`WebSocket Error: ${error.message || error}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
      this.isConnected = false;
    };

    client.onWebSocketClose = (event: CloseEvent) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.isConnected = false;
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
   * Get error observable
   */
  get errors(): Observable<string> {
    return this.errors$.asObservable();
  }

  /**
   * Check if currently connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.activate();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    try {
      this.clearSubscriptions();
      
      if (this.client && this.client.connected) {
        this.client.deactivate();
      }
      
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.isConnected = false;
    } catch (error) {
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    }
  }

  /**
   * Subscribe to all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    if (!this.isConnected) {
      // Return empty observable that never emits when WebSocket is not connected
      return new Observable(subscriber => {
        // This observable will never emit and will complete immediately
        subscriber.complete();
      });
    }

    const subscription = this.client.subscribe('/topic/nse-indices', (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        const indicesData = this.parseIndicesData(data);
        this.allIndicesData$.next(indicesData);
      } catch (error) {
        // Silent error handling
      }
    });

    this.activeSubscriptions.set('all-indices', subscription);

    return this.allIndicesData$.pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Subscribe to specific index data
   */
  subscribeToIndex(indexName: string): Observable<any> {
    if (!this.isConnected) {
      // Return empty observable that never emits when WebSocket is not connected
      return new Observable(subscriber => {
        // This observable will never emit and will complete immediately
        subscriber.complete();
      });
    }

    // Check if already subscribed
    const subscriptionKey = `index-${indexName}`;
    if (this.activeSubscriptions.has(subscriptionKey)) {
      if (!this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.set(indexName, new BehaviorSubject<any>(null));
      }
      return this.specificIndicesData.get(indexName)!.pipe(
        filter((data): data is any => data !== null)
      );
    }

    // Subscribe to topic
    const topic = `/topic/nse-indices/${indexName.replace(/\s+/g, '-').toLowerCase()}`;
    
    try {
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          
          // Update the specific index data
          if (!this.specificIndicesData.has(indexName)) {
            this.specificIndicesData.set(indexName, new BehaviorSubject<any>(null));
          }
          this.specificIndicesData.get(indexName)?.next(data);
        } catch (error) {
          // Silent error handling
        }
      });

      this.activeSubscriptions.set(subscriptionKey, subscription);

      // Ensure we have a BehaviorSubject for this index
      if (!this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.set(indexName, new BehaviorSubject<any>(null));
      }

      return this.specificIndicesData.get(indexName)!.pipe(
        filter((data): data is any => data !== null)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current data for a specific index (synchronous)
   */
  getCurrentIndexData(indexName: string): any {
    const subject = this.specificIndicesData.get(indexName);
    return subject ? subject.value : null;
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    const subscription = this.activeSubscriptions.get('all-indices');
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete('all-indices');
      this.allIndicesData$.next(null);
    }
  }

  /**
   * Unsubscribe from specific index data
   */
  unsubscribeFromIndex(indexName: string): void {
    const subscriptionKey = `index-${indexName}`;
    const subscription = this.activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
      
      if (this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.get(indexName)?.next(null);
      }
    }
  }

  /**
   * Send message to WebSocket
   */
  sendMessage(destination: string, message: any): void {
    if (this.isConnected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
    }
  }

  /**
   * Clear all subscriptions
   */
  private clearSubscriptions(): void {
    this.activeSubscriptions.forEach((subscription, key) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        // Silent error handling
      }
    });
    
    this.activeSubscriptions.clear();
    this.allIndicesData$.next(null);
    this.specificIndicesData.forEach((subject, indexName) => {
      subject.next(null);
    });
  }

  /**
   * Parse indices data from WebSocket message
   */
  private parseIndicesData(data: any): IndicesDto {
    if (data.indices && Array.isArray(data.indices)) {
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        indices: data.indices.map((index: any) => this.parseIndexData(index)),
        source: data.source || 'Engines STOMP WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    if (data.indexName || data.indexSymbol) {
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        indices: [this.parseIndexData(data)],
        source: data.source || 'Engines STOMP WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    return {
      timestamp: new Date().toISOString(),
      indices: [],
      source: 'Engines STOMP WebSocket',
      marketStatus: { status: 'UNKNOWN' }
    };
  }

  /**
   * Parse individual index data
   */
  private parseIndexData(indexData: any): IndexDataDto {
    return {
      key: indexData.key || indexData.indexName || indexData.name,
      indexName: indexData.indexName || indexData.name,
      indexSymbol: indexData.indexSymbol || indexData.symbol,
      lastPrice: indexData.lastPrice || indexData.currentPrice || indexData.last || 0,
      variation: indexData.variation || indexData.change || 0,
      percentChange: indexData.percentChange || indexData.perChange || 0,
      openPrice: indexData.openPrice || indexData.open || 0,
      dayHigh: indexData.dayHigh || indexData.high || 0,
      dayLow: indexData.dayLow || indexData.low || 0,
      previousClose: indexData.previousClose || indexData.prevClose || 0,
      yearHigh: indexData.yearHigh || 0,
      yearLow: indexData.yearLow || 0,
      indicativeClose: indexData.indicativeClose || 0,
      peRatio: indexData.peRatio || 0,
      pbRatio: indexData.pbRatio || 0,
      dividendYield: indexData.dividendYield || 0,
      declines: indexData.declines || 0,
      advances: indexData.advances || 0,
      unchanged: indexData.unchanged || 0,
      percentChange365d: indexData.percentChange365d || 0,
      date365dAgo: indexData.date365dAgo || '',
      percentChange30d: indexData.percentChange30d || 0,
      date30dAgo: indexData.date30dAgo || '',
      chart365dPath: indexData.chart365dPath || '',
      chart30dPath: indexData.chart30dPath || '',
      chartTodayPath: indexData.chartTodayPath || '',
    };
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
