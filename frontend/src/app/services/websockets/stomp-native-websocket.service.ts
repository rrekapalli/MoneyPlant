import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter, map, share, takeUntil, catchError, retry, delay } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';

export interface StompMessage {
  command: string;
  headers: { [key: string]: string };
  body?: string;
}

export interface StompWebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
}

/**
 * Native Angular v20 STOMP-compatible WebSocket service
 * Communicates with Spring Boot STOMP endpoints without external dependencies
 */
@Injectable({
  providedIn: 'root'
})
export class StompNativeWebSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private errors$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private config: StompWebSocketConfig | null = null;
  
  // STOMP specific
  private subscriptionId = 1;
  private subscriptions = new Map<string, string>(); // destination -> subscription-id
  private connected = false;
  
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
    return this.connected && this.socket$ !== null && !this.socket$.closed;
  }

  /**
   * Connect to STOMP WebSocket server
   */
  async connect(config: StompWebSocketConfig): Promise<void> {
    this.config = config;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.reconnectInterval = config.reconnectInterval || 3000;

    if (this.isConnected) {
      if (config.debug) {
        console.log('STOMP WebSocket already connected');
      }
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.connectionState$.next(WebSocketConnectionState.CONNECTING);
        
        if (config.debug) {
          console.log('Connecting to STOMP WebSocket:', config.url);
        }

        // Create WebSocket connection
        this.socket$ = webSocket({
          url: config.url,
          protocol: 'v12.stomp',
          openObserver: {
            next: () => {
              if (config.debug) {
                console.log('WebSocket connection opened, sending CONNECT frame');
              }
              this.sendConnectFrame();
            }
          },
          closeObserver: {
            next: (closeEvent) => {
              this.connected = false;
              this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
              if (config.debug) {
                console.log('STOMP WebSocket disconnected:', closeEvent);
              }
              this.handleReconnection();
            }
          }
        });

        // Subscribe to messages
        this.socket$.pipe(
          takeUntil(this.destroy$),
          map((message: string) => this.parseStompFrame(message)),
          filter((frame) => frame !== null),
          catchError((error) => {
            const errorMsg = `STOMP WebSocket error: ${error.message || error}`;
            console.warn(errorMsg); // Changed to warn to reduce console noise
            this.errors$.next(errorMsg);
            this.connectionState$.next(WebSocketConnectionState.ERROR);
            reject(error);
            return [];
          })
        ).subscribe({
          next: (frame) => {
            this.handleStompFrame(frame!, resolve, reject);
          },
          error: (error) => {
            const errorMsg = `STOMP subscription error: ${error.message || error}`;
            console.warn(errorMsg); // Changed to warn to reduce console noise
            this.errors$.next(errorMsg);
            this.connectionState$.next(WebSocketConnectionState.ERROR);
            reject(error);
          }
        });

      } catch (error) {
        const errorMsg = `Failed to create STOMP WebSocket connection: ${error}`;
        console.error(errorMsg);
        this.errors$.next(errorMsg);
        this.connectionState$.next(WebSocketConnectionState.ERROR);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    const destination = '/topic/indices';
    this.subscribeToDestination(destination);

    if (this.config?.debug) {
      console.log('Subscribed to all indices via STOMP');
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
    const destination = `/topic/indices/${normalizedIndexName}`;
    const subscriptionKey = `index-${normalizedIndexName}`;
    
    // Create data subject if it doesn't exist
    if (!this.specificIndicesData.has(subscriptionKey)) {
      this.specificIndicesData.set(subscriptionKey, new BehaviorSubject<IndicesDto | null>(null));
    }

    this.subscribeToDestination(destination);

    if (this.config?.debug) {
      console.log(`Subscribed to index via STOMP: ${normalizedIndexName}`);
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
    const destination = '/topic/indices';
    this.unsubscribeFromDestination(destination);
    this.allIndicesData$.next(null);

    if (this.config?.debug) {
      console.log('Unsubscribed from all indices via STOMP');
    }
  }

  /**
   * Unsubscribe from specific index
   */
  unsubscribeFromIndex(indexName: string): void {
    const normalizedIndexName = indexName.toUpperCase().replace(/\s+/g, '-');
    const destination = `/topic/indices/${normalizedIndexName}`;
    const subscriptionKey = `index-${normalizedIndexName}`;
    
    this.unsubscribeFromDestination(destination);
    
    const dataSubject = this.specificIndicesData.get(subscriptionKey);
    if (dataSubject) {
      dataSubject.next(null);
      this.specificIndicesData.delete(subscriptionKey);
    }

    if (this.config?.debug) {
      console.log(`Unsubscribed from index via STOMP: ${normalizedIndexName}`);
    }
  }

  /**
   * Disconnect from STOMP WebSocket
   */
  disconnect(): void {
    if (this.isConnected) {
      this.sendDisconnectFrame();
    }

    this.subscriptions.clear();
    this.specificIndicesData.clear();
    this.allIndicesData$.next(null);
    this.connected = false;

    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
    
    if (this.config?.debug) {
      console.log('STOMP WebSocket disconnected');
    }
  }

  /**
   * Send STOMP CONNECT frame
   */
  private sendConnectFrame(): void {
    const connectFrame = this.buildStompFrame('CONNECT', {
      'accept-version': '1.2',
      'host': window.location.host,
      'heart-beat': `${this.config?.heartbeatOutgoing || 0},${this.config?.heartbeatIncoming || 0}`
    });

    this.sendFrame(connectFrame);
  }

  /**
   * Send STOMP DISCONNECT frame
   */
  private sendDisconnectFrame(): void {
    const disconnectFrame = this.buildStompFrame('DISCONNECT', {});
    this.sendFrame(disconnectFrame);
  }

  /**
   * Subscribe to a STOMP destination
   */
  private subscribeToDestination(destination: string): void {
    if (this.subscriptions.has(destination)) {
      if (this.config?.debug) {
        console.log(`Already subscribed to: ${destination}`);
      }
      return;
    }

    const subId = `sub-${this.subscriptionId++}`;
    this.subscriptions.set(destination, subId);

    const subscribeFrame = this.buildStompFrame('SUBSCRIBE', {
      'id': subId,
      'destination': destination
    });

    this.sendFrame(subscribeFrame);
  }

  /**
   * Unsubscribe from a STOMP destination
   */
  private unsubscribeFromDestination(destination: string): void {
    const subId = this.subscriptions.get(destination);
    if (!subId) {
      return;
    }

    this.subscriptions.delete(destination);

    const unsubscribeFrame = this.buildStompFrame('UNSUBSCRIBE', {
      'id': subId
    });

    this.sendFrame(unsubscribeFrame);
  }

  /**
   * Build STOMP frame
   */
  private buildStompFrame(command: string, headers: { [key: string]: string }, body?: string): string {
    let frame = command + '\n';
    
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    
    frame += '\n';
    
    if (body) {
      frame += body;
    }
    
    frame += '\0';
    
    return frame;
  }

  /**
   * Send STOMP frame
   */
  private sendFrame(frame: string): void {
    if (this.socket$) {
      this.socket$.next(frame);
      
      if (this.config?.debug) {
        console.log('Sent STOMP frame:', frame);
      }
    }
  }

  /**
   * Parse STOMP frame from string
   */
  private parseStompFrame(data: string): StompMessage | null {
    try {
      const lines = data.split('\n');
      const command = lines[0];
      const headers: { [key: string]: string } = {};
      let bodyStart = -1;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') {
          bodyStart = i + 1;
          break;
        }
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex);
          const value = line.substring(colonIndex + 1);
          headers[key] = value;
        }
      }

      let body = '';
      if (bodyStart > 0 && bodyStart < lines.length) {
        body = lines.slice(bodyStart).join('\n');
        // Remove null terminator
        if (body.endsWith('\0')) {
          body = body.slice(0, -1);
        }
      }

      return {
        command,
        headers,
        body: body || undefined
      };
    } catch (error) {
      console.error('Failed to parse STOMP frame:', error);
      return null;
    }
  }

  /**
   * Handle STOMP frame
   */
  private handleStompFrame(frame: StompMessage, resolve?: () => void, reject?: (error: any) => void): void {
    if (this.config?.debug) {
      console.log('Received STOMP frame:', frame);
    }

    switch (frame.command) {
      case 'CONNECTED':
        this.connected = true;
        this.connectionState$.next(WebSocketConnectionState.CONNECTED);
        this.reconnectAttempts = 0;
        if (this.config?.debug) {
          console.log('STOMP connection established');
        }
        if (resolve) resolve();
        break;

      case 'MESSAGE':
        this.handleMessage(frame);
        break;

      case 'ERROR':
        const errorMsg = `STOMP error: ${frame.headers['message'] || 'Unknown error'}`;
        console.error(errorMsg);
        this.errors$.next(errorMsg);
        this.connectionState$.next(WebSocketConnectionState.ERROR);
        if (reject) reject(new Error(errorMsg));
        break;

      case 'RECEIPT':
        // Handle receipt if needed
        break;

      default:
        if (this.config?.debug) {
          console.log('Unknown STOMP frame:', frame);
        }
    }
  }

  /**
   * Handle MESSAGE frame
   */
  private handleMessage(frame: StompMessage): void {
    try {
      if (!frame.body) {
        return;
      }

      const messageData = JSON.parse(frame.body);
      const destination = frame.headers['destination'];

      // Create IndicesDto from the message
      const indicesData: IndicesDto = {
        timestamp: messageData.timestamp || new Date().toISOString(),
        indices: messageData.indices || [messageData], // Handle both array and single object
        marketStatus: messageData.marketStatus,
        source: 'WebSocket'
      };

      // Route to appropriate data stream
      if (destination === '/topic/indices') {
        this.allIndicesData$.next(indicesData);
      } else if (destination?.startsWith('/topic/indices/')) {
        const indexName = destination.split('/').pop()?.toUpperCase();
        if (indexName) {
          const subscriptionKey = `index-${indexName}`;
          const dataSubject = this.specificIndicesData.get(subscriptionKey);
          if (dataSubject) {
            dataSubject.next(indicesData);
          }
        }
      }

    } catch (error) {
      console.error('Error processing STOMP message:', error);
      this.errors$.next(`Failed to process message: ${error}`);
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max STOMP reconnection attempts reached');
      this.errors$.next('Max reconnection attempts reached');
      return;
    }

    if (this.subscriptions.size > 0) {
      this.reconnectAttempts++;
      this.connectionState$.next(WebSocketConnectionState.RECONNECTING);
      
      setTimeout(() => {
        if (this.config) {
          console.log(`STOMP reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          this.connect(this.config).catch(error => {
            console.error('STOMP reconnection failed:', error);
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