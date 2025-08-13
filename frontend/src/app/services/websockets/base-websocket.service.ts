import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, IMessage, IStompSocket, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebSocketConnectionState, WebSocketServiceConfig } from '../entities/indices-websocket';
import { environment } from '../../../environments/environment';

/**
 * Base WebSocket service providing common WebSocket functionality
 * Now connects to engines project instead of backend
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
   * Get current connection state
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
   * Initialize WebSocket connection to engines
   */
  connect(config: WebSocketServiceConfig): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve();
    }

    this.connectionState$.next(WebSocketConnectionState.CONNECTING);

    return new Promise((resolve, reject) => {
      try {
        // Use engines WebSocket endpoint if no specific broker URL provided
        const brokerURL = config.brokerURL || `${environment.enginesWebSocketUrl}/ws/engines`;
        
        this.client = new Client({
          webSocketFactory: () => new SockJS(brokerURL) as IStompSocket,
          heartbeatIncoming: config.heartbeatIncoming || 4000,
          heartbeatOutgoing: config.heartbeatOutgoing || 4000,
          reconnectDelay: config.reconnectDelay || this.reconnectInterval,
          debug: config.debug ? (str: string) => console.log('STOMP Debug:', str) : undefined,
        });

        this.client.onConnect = () => {
          this.connectionState$.next(WebSocketConnectionState.CONNECTED);
          this.reconnectAttempts = 0;
          console.log('Connected to engines WebSocket successfully');
          resolve();
        };

        this.client.onDisconnect = () => {
          this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
          console.log('Disconnected from engines WebSocket');
          this.handleReconnection();
        };

        this.client.onStompError = (frame) => {
          const errorMsg = `WebSocket STOMP error from engines: ${frame.headers['message']} - ${frame.body}`;
          console.error(errorMsg);
          this.error$.next(errorMsg);
          this.connectionState$.next(WebSocketConnectionState.ERROR);
          reject(new Error(errorMsg));
        };

        this.client.onWebSocketError = (error) => {
          const errorMsg = `WebSocket error from engines: ${error}`;
          console.error(errorMsg);
          this.error$.next(errorMsg);
          this.connectionState$.next(WebSocketConnectionState.ERROR);
          reject(error);
        };

        this.client.activate();
      } catch (error) {
        const errorMsg = `Failed to initialize engines WebSocket: ${error}`;
        console.error(errorMsg);
        this.error$.next(errorMsg);
        this.connectionState$.next(WebSocketConnectionState.ERROR);
        reject(new Error(errorMsg));
      }
    });
  }

  /**
   * Disconnect from engines WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.clearSubscriptions();
    this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
  }

  /**
   * Subscribe to a topic
   */
  subscribe(topic: string, callback: (message: any) => void): StompSubscription | null {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return null;
    }

    try {
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('Error parsing message:', error);
          this.error$.next(`Failed to parse message: ${error}`);
        }
      });

      this.subscriptions.set(topic, subscription);
      console.log(`Subscribed to topic: ${topic}`);
      return subscription;

    } catch (error) {
      console.error('Error subscribing to topic:', error);
      this.error$.next(`Failed to subscribe to topic ${topic}: ${error}`);
      return null;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic: string): boolean {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
      return true;
    }
    return false;
  }

  /**
   * Publish message to a topic
   */
  publish(destination: string, message: any): boolean {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot publish: WebSocket not connected');
      return false;
    }

    try {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
      console.log(`Published message to: ${destination}`);
      return true;

    } catch (error) {
      console.error('Error publishing message:', error);
      this.error$.next(`Failed to publish message to ${destination}: ${error}`);
      return false;
    }
  }

  /**
   * Handle reconnection to engines
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached for engines WebSocket');
      this.error$.next('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect to engines WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.currentConnectionState === WebSocketConnectionState.DISCONNECTED) {
        this.connect({
          brokerURL: `${environment.enginesWebSocketUrl}/ws/engines`,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: this.reconnectInterval,
          debug: false
        }).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  /**
   * Clear all subscriptions
   */
  private clearSubscriptions(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Check if subscribed to a topic
   */
  isSubscribedTo(topic: string): boolean {
    return this.subscriptions.has(topic);
  }

  /**
   * Get all active topic names
   */
  getActiveTopics(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
  }
}