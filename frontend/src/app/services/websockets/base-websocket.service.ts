import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, IMessage, IStompSocket, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebSocketConnectionState, WebSocketServiceConfig } from '../entities/indices-websocket';

/**
 * Base WebSocket service providing common WebSocket functionality
 */
@Injectable({
  providedIn: 'root'
})
export class BaseWebSocketService {
  private client: Client | null = null;
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private error$ = new Subject<string>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private subscriptions = new Map<string, StompSubscription>();

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
    return this.error$.asObservable();
  }

  /**
   * Get current connection state value
   */
  get currentConnectionState(): WebSocketConnectionState {
    return this.connectionState$.value;
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.client?.connected === true;
  }

  /**
   * Initialize WebSocket connection
   */
  connect(config: WebSocketServiceConfig): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve();
    }

    this.connectionState$.next(WebSocketConnectionState.CONNECTING);

    return new Promise((resolve, reject) => {
      try {
        this.client = new Client({
          webSocketFactory: () => new SockJS(config.brokerURL) as IStompSocket,
          heartbeatIncoming: config.heartbeatIncoming || 4000,
          heartbeatOutgoing: config.heartbeatOutgoing || 4000,
          reconnectDelay: config.reconnectDelay || this.reconnectInterval,
          debug: config.debug ? (str: string) => console.log('STOMP Debug:', str) : undefined,
        });

        this.client.onConnect = () => {
          this.connectionState$.next(WebSocketConnectionState.CONNECTED);
          this.reconnectAttempts = 0;
          console.log('WebSocket connected successfully');
          resolve();
        };

        this.client.onDisconnect = () => {
          this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
          console.log('WebSocket disconnected');
          this.handleReconnection();
        };

        this.client.onStompError = (frame) => {
          const errorMsg = `WebSocket STOMP error: ${frame.headers['message']} - ${frame.body}`;
          console.error(errorMsg);
          this.error$.next(errorMsg);
          this.connectionState$.next(WebSocketConnectionState.ERROR);
          reject(new Error(errorMsg));
        };

        this.client.onWebSocketError = (error) => {
          const errorMsg = `WebSocket error: ${error}`;
          console.error(errorMsg);
          this.error$.next(errorMsg);
          this.connectionState$.next(WebSocketConnectionState.ERROR);
          reject(error);
        };

        this.client.activate();
      } catch (error) {
        const errorMsg = `Failed to initialize WebSocket: ${error}`;
        console.error(errorMsg);
        this.error$.next(errorMsg);
        this.connectionState$.next(WebSocketConnectionState.ERROR);
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): Promise<void> {
    if (!this.client) {
      return Promise.resolve();
    }

    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();

    return new Promise((resolve) => {
      if (this.client) {
        this.client.onDisconnect = () => {
          this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
          console.log('WebSocket disconnected');
          resolve();
        };
        this.client.deactivate();
      } else {
        resolve();
      }
    });
  }

  /**
   * Subscribe to a destination
   */
  subscribe<T>(destination: string, callback: (data: T) => void): string {
    if (!this.isConnected) {
      throw new Error('WebSocket is not connected. Call connect() first.');
    }

    const subscriptionId = this.generateSubscriptionId();
    
    const subscription = this.client!.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body) as T;
        callback(data);
      } catch (error) {
        console.error(`Error parsing message from ${destination}:`, error);
        this.error$.next(`Failed to parse message: ${error}`);
      }
    });

    this.subscriptions.set(subscriptionId, subscription);
    console.log(`Subscribed to ${destination} with ID: ${subscriptionId}`);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from a destination
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from subscription ID: ${subscriptionId}`);
    }
  }

  /**
   * Send a message to a destination
   */
  send(destination: string, body: any = {}): void {
    if (!this.isConnected) {
      throw new Error('WebSocket is not connected. Call connect() first.');
    }

    this.client!.publish({
      destination,
      body: JSON.stringify(body)
    });
  }

  /**
   * Handle automatic reconnection
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.connectionState$.next(WebSocketConnectionState.RECONNECTING);
      
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.client && !this.isConnected) {
          this.client.activate();
        }
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.error$.next('Connection lost and max reconnection attempts reached');
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set max reconnection attempts
   */
  setMaxReconnectAttempts(attempts: number): void {
    this.maxReconnectAttempts = attempts;
  }

  /**
   * Set reconnection interval
   */
  setReconnectInterval(interval: number): void {
    this.reconnectInterval = interval;
  }
}