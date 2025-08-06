import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { StompNativeWebSocketService, StompWebSocketConfig } from './stomp-native-websocket.service';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';

/**
 * Modern Angular v20 Indices WebSocket Service
 * High-level service for NSE indices data using native Angular WebSocket capabilities
 * No external dependencies - uses RxJS WebSocketSubject internally
 */
@Injectable({
  providedIn: 'root'
})
export class ModernIndicesWebSocketService {
  private readonly config: StompWebSocketConfig = {
    url: 'ws://localhost:4200/ws/indices', // Proxied through Angular dev server
    reconnectInterval: 5000,
    maxReconnectAttempts: 3, // Reduced attempts to avoid spam
    debug: false, // Disable debug to reduce console noise
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000
  };

  constructor(private stompWebSocket: StompNativeWebSocketService) {}

  /**
   * Get connection state
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.stompWebSocket.connectionState;
  }

  /**
   * Get error observable
   */
  get errors(): Observable<string> {
    return this.stompWebSocket.errors;
  }

  /**
   * Check if currently connected
   */
  get isConnected(): boolean {
    return this.stompWebSocket.isConnected;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    try {
      await this.stompWebSocket.connect(this.config);
      console.log('Modern Indices WebSocket connected successfully');
    } catch (error) {
      console.warn('WebSocket connection failed - backend may not be available:', (error as Error).message || error);
      // Don't throw error to allow app to continue functioning without WebSocket
    }
  }

  /**
   * Subscribe to all indices data
   * @returns Observable of all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    console.log('Subscribing to all indices data...');
    return this.stompWebSocket.subscribeToAllIndices();
  }

  /**
   * Subscribe to specific index data
   * @param indexName The name of the index (e.g., "NIFTY-50", "SENSEX")
   * @returns Observable of specific index data
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    console.log(`Subscribing to index: ${indexName}`);
    return this.stompWebSocket.subscribeToIndex(indexName);
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    console.log('Unsubscribing from all indices...');
    this.stompWebSocket.unsubscribeFromAllIndices();
  }

  /**
   * Unsubscribe from specific index data
   * @param indexName The name of the index to unsubscribe from
   */
  unsubscribeFromIndex(indexName: string): void {
    console.log(`Unsubscribing from index: ${indexName}`);
    this.stompWebSocket.unsubscribeFromIndex(indexName);
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    console.log('Disconnecting from Modern Indices WebSocket...');
    this.stompWebSocket.disconnect();
  }

  /**
   * Get current connection state
   */
  getCurrentConnectionState(): Observable<WebSocketConnectionState> {
    return this.stompWebSocket.connectionState;
  }
}