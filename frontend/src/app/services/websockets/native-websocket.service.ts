import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent, map, takeUntil, filter } from 'rxjs';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';

export interface NativeWebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

/**
 * Modern native WebSocket service for Angular v20+
 * No external dependencies required - uses browser native WebSocket API
 */
@Injectable({
  providedIn: 'root'
})
export class NativeWebSocketService {
  private socket: WebSocket | null = null;
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private messages$ = new Subject<any>();
  private errors$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private config: NativeWebSocketConfig | null = null;

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
   * Get current connection state
   */
  get currentConnectionState(): WebSocketConnectionState {
    return this.connectionState$.value;
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to WebSocket server
   */
  connect(config: NativeWebSocketConfig): Promise<void> {
    this.config = config;
    
    if (this.isConnected) {
      return Promise.resolve();
    }

    this.connectionState$.next(WebSocketConnectionState.CONNECTING);

    return new Promise((resolve, reject) => {
      try {
        // Create WebSocket connection
        this.socket = new WebSocket(config.url);

        // Connection opened
        this.socket.onopen = (event) => {
          this.connectionState$.next(WebSocketConnectionState.CONNECTED);
          this.reconnectAttempts = 0;
          if (config.debug) {
            console.log('Native WebSocket connected:', event);
          }
          resolve();
        };

        // Message received
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messages$.next(data);
            if (config.debug) {
              console.log('WebSocket message received:', data);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            this.errors$.next(`Failed to parse message: ${error}`);
          }
        };

        // Connection closed
        this.socket.onclose = (event) => {
          this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
          if (config.debug) {
            console.log('WebSocket connection closed:', event);
          }
          
          // Attempt reconnection if not intentionally closed
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        // Connection error
        this.socket.onerror = (error) => {
          const errorMsg = `WebSocket error: ${error}`;
          console.error(errorMsg);
          this.errors$.next(errorMsg);
          this.connectionState$.next(WebSocketConnectionState.ERROR);
          reject(error);
        };

      } catch (error) {
        const errorMsg = `Failed to create WebSocket: ${error}`;
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
    if (this.isConnected && this.socket) {
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        this.socket.send(messageStr);
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
   * Subscribe to messages of a specific type
   */
  subscribe<T>(messageType?: string): Observable<T> {
    return this.messages$.pipe(
      takeUntil(this.destroy$),
      map((data: any) => {
        // If messageType is specified, filter messages
        if (messageType && data.type !== messageType) {
          return null;
        }
        return data as T;
      }),
      filter((data: any): data is T => data !== null)
    );
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Normal closure');
      this.socket = null;
    }
    this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.errors$.next('Max reconnection attempts reached');
      return;
    }

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

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}