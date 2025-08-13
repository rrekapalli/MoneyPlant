import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NseIndicesTickDto } from '../entities/nse-indices';

/**
 * WebSocket service for connecting to MoneyPlant Engines module
 * Provides real-time data streaming for NSE indices and other engine data
 * Connects to engines project WebSocket endpoints instead of backend
 */
@Injectable({
  providedIn: 'root'
})
export class EnginesWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private reconnectTimer: any = null;

  // Subjects for different data streams
  private nseIndicesSubject = new Subject<NseIndicesTickDto>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new Subject<string>();

  // Public observables
  public nseIndices$ = this.nseIndicesSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public errors$ = this.errorSubject.asObservable();

  constructor() {
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection to engines module
   * Uses the new engines WebSocket endpoints instead of backend
   */
  private initializeWebSocket(): void {
    try {
      // Use the engines WebSocket endpoint for NSE indices
      const wsUrl = environment.enginesWebSocketUrl + '/ws/nse-indices-native';
      console.log('Connecting to engines WebSocket:', wsUrl);
      
      this.socket = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
      
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.errorSubject.next('Failed to initialize WebSocket connection');
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('Connected to engines WebSocket');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;
      
      // Subscribe to all NSE indices data
      this.subscribeToAllIndices();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.errorSubject.next('Invalid message format received');
      }
    };

    this.socket.onclose = (event) => {
      console.log('Engines WebSocket connection closed:', event.code, event.reason);
      this.connectionStatusSubject.next(false);
      
      if (!event.wasClean) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('Engines WebSocket error:', error);
      this.errorSubject.next('WebSocket connection error');
      this.connectionStatusSubject.next(false);
    };
  }

  /**
   * Handle incoming WebSocket messages from engines
   */
  private handleWebSocketMessage(data: any): void {
    if (data && data.indices) {
      // This is NSE indices data from engines
      this.nseIndicesSubject.next(data);
    } else if (data && data.type === 'nse-indices') {
      // Alternative format for NSE indices data
      this.nseIndicesSubject.next(data);
    } else {
      console.log('Received WebSocket message from engines:', data);
    }
  }

  /**
   * Subscribe to all NSE indices data
   */
  private subscribeToAllIndices(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'subscribe',
        channel: 'nse-indices'
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Subscribe to specific NSE index data
   */
  public subscribeToIndex(indexName: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'subscribe',
        channel: 'nse-indices',
        index: indexName
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Unsubscribe from all NSE indices data
   */
  public unsubscribeFromAllIndices(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'unsubscribe',
        channel: 'nse-indices'
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Unsubscribe from specific NSE index data
   */
  public unsubscribeFromIndex(indexName: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'unsubscribe',
        channel: 'nse-indices',
        index: indexName
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Start NSE indices ingestion
   */
  public startIngestion(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'start-ingestion'
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Stop NSE indices ingestion
   */
  public stopIngestion(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'stop-ingestion'
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Trigger manual ingestion
   */
  public triggerIngestion(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        action: 'trigger-ingestion'
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.errorSubject.next('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.initializeWebSocket();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  /**
   * Manually reconnect to WebSocket
   */
  public reconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
    this.initializeWebSocket();
  }

  /**
   * Close WebSocket connection
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connectionStatusSubject.next(false);
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$;
  }

  /**
   * Get NSE indices data stream
   */
  public getNseIndicesStream(): Observable<NseIndicesTickDto> {
    return this.nseIndices$;
  }

  /**
   * Get error stream
   */
  public getErrorStream(): Observable<string> {
    return this.errors$;
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.disconnect();
  }
}
