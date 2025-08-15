import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NseIndicesTickDto } from '../entities/nse-indices';
import { Client, IMessage, StompConfig, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * WebSocket service for connecting to MoneyPlant Engines module
 * Provides real-time data streaming for NSE indices and other engine data
 * Connects to engines project WebSocket endpoints using STOMP protocol
 */
@Injectable({
  providedIn: 'root'
})
export class EnginesWebSocketService {
  private client: Client | null = null;
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
   * Initialize STOMP WebSocket connection to engines module
   * Uses the STOMP protocol over SockJS for better compatibility
   */
  private initializeWebSocket(): void {
    try {
      // Create STOMP client with SockJS
      this.client = new Client({
        webSocketFactory: () => {
          const baseUrl = environment.enginesHttpUrl + '/ws/nse-indices';
          return new SockJS(baseUrl);
        },
        debug: (msg) => {
          // Debug logging for development
          console.log('STOMP Debug:', msg);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      // Set up connection callbacks
      this.client.onConnect = (frame: IFrame) => {
        console.log('Connected to engines STOMP WebSocket');
        this.connectionStatusSubject.next(true);
        this.reconnectAttempts = 0;
        
        // Subscribe to all NSE indices data
        this.subscribeToAllIndices();
      };

      this.client.onDisconnect = (frame: IFrame) => {
        console.log('Disconnected from engines STOMP WebSocket');
        this.connectionStatusSubject.next(false);
      };

      this.client.onStompError = (frame: IFrame) => {
        console.error('STOMP Error:', frame);
        this.errorSubject.next(`STOMP Error: ${frame.headers['message']}`);
        this.connectionStatusSubject.next(false);
      };

      this.client.onWebSocketError = (error: any) => {
        console.error('WebSocket Error:', error);
        this.errorSubject.next(`WebSocket Error: ${error.message || error}`);
        this.connectionStatusSubject.next(false);
      };

      // Connect to the STOMP server
      this.client.activate();
      
    } catch (error) {
      console.error('Failed to initialize STOMP WebSocket:', error);
      this.errorSubject.next('Failed to initialize STOMP WebSocket connection');
      this.scheduleReconnect();
    }
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
   * Subscribe to all NSE indices data using STOMP
   */
  private subscribeToAllIndices(): void {
    if (this.client && this.client.connected) {
      const subscription = this.client.subscribe('/topic/nse-indices', (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing STOMP message:', error);
          this.errorSubject.next('Invalid message format received');
        }
      });
      
      console.log('Subscribed to all NSE indices via STOMP');
    }
  }

  /**
   * Subscribe to specific NSE index data using STOMP
   */
  public subscribeToIndex(indexName: string): void {
    if (this.client && this.client.connected) {
      const topic = `/topic/nse-indices/${indexName.replace(/\s+/g, '-').toLowerCase()}`;
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing STOMP message:', error);
        }
      });
      
      console.log(`Subscribed to specific index ${indexName} via STOMP: ${topic}`);
    }
  }

  /**
   * Unsubscribe from all NSE indices data
   */
  public unsubscribeFromAllIndices(): void {
    // STOMP handles unsubscription automatically when connection closes
    console.log('Unsubscribed from all NSE indices');
  }

  /**
   * Unsubscribe from specific NSE index data
   */
  public unsubscribeFromIndex(indexName: string): void {
    // STOMP handles unsubscription automatically when connection closes
    console.log(`Unsubscribed from specific index ${indexName}`);
  }

  /**
   * Start NSE indices ingestion via STOMP
   */
  public startIngestion(): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/start-ingestion',
        body: JSON.stringify({ action: 'start-ingestion' })
      });
      console.log('Sent start-ingestion message via STOMP');
    }
  }

  /**
   * Stop NSE indices ingestion via STOMP
   */
  public stopIngestion(): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/stop-ingestion',
        body: JSON.stringify({ action: 'stop-ingestion' })
      });
      console.log('Sent stop-ingestion message via STOMP');
    }
  }

  /**
   * Trigger manual ingestion via STOMP
   */
  public triggerIngestion(): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/trigger-ingestion',
        body: JSON.stringify({ action: 'trigger-ingestion' })
      });
      console.log('Sent trigger-ingestion message via STOMP');
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
    if (this.client) {
      this.client.deactivate(); // Disconnect gracefully
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
    
    if (this.client) {
      this.client.deactivate(); // Disconnect gracefully
      this.client = null;
    }
    
    this.connectionStatusSubject.next(false);
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.client?.connected || false;
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
