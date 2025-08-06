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
    if (this.isConnected) {
      return;
    }

    try {
      await this.stompWebSocket.connect();
    } catch (error) {
      console.error('WebSocket connection failed - backend may not be available:', error);
      throw error;
    }
  }

  /**
   * Subscribe to all indices data
   * @returns Observable of all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    return this.stompWebSocket.subscribeToAllIndices();
  }

  /**
   * Subscribe to specific index data
   * @param indexName The name of the index (e.g., "NIFTY-50", "SENSEX")
   * @returns Observable of specific index data
   */
  subscribeToIndex(indexName: string): Observable<IndicesDto> {
    return this.stompWebSocket.subscribeToIndex(indexName);
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    this.stompWebSocket.unsubscribeFromAllIndices();
  }

  /**
   * Unsubscribe from specific index data
   * @param indexName The name of the index to unsubscribe from
   */
  unsubscribeFromIndex(indexName: string): void {
    this.stompWebSocket.unsubscribeFromIndex(indexName);
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    this.stompWebSocket.disconnect();
  }

  /**
   * Get current connection state
   */
  getCurrentConnectionState(): Observable<WebSocketConnectionState> {
    return this.stompWebSocket.connectionState;
  }
}