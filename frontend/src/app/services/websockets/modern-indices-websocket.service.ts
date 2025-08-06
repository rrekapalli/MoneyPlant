import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { StompNativeWebSocketService } from './stomp-native-websocket.service';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';
import { environment } from '../../../environments/environment';

/**
 * Modern Angular v20 Indices WebSocket Service
 * High-level service for NSE indices data using proper STOMP over SockJS
 * Uses @stomp/stompjs and sockjs-client libraries for full compatibility
 */
@Injectable({
  providedIn: 'root'
})
export class ModernIndicesWebSocketService {

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
      console.log('Connecting to Modern Indices WebSocket using STOMP over SockJS...');
      await this.stompWebSocket.connect();
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
    console.log('Subscribing to all indices data via STOMP...');
    return this.stompWebSocket.subscribeToAllIndices();
  }

  /**
   * Subscribe to specific index data
   * @param indexName The name of the index (e.g., "NIFTY-50", "SENSEX")
   * @returns Observable of specific index data
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    console.log(`Subscribing to index via STOMP: ${indexName}`);
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