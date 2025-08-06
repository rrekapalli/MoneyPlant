# Frontend WebSocket Services

This module provides TypeScript services for consuming the NSE Indices WebSocket endpoints from the backend.

## Overview

The WebSocket implementation consists of:
- `BaseWebSocketService` - Core WebSocket functionality using STOMP over SockJS
- `IndicesWebSocketService` - Specific service for NSE indices data
- `indices-websocket.ts` - TypeScript interfaces matching backend DTOs
- `IndicesWebSocketDemoComponent` - Demo component for testing

## Dependencies

The implementation uses the following libraries:
- `@stomp/stompjs` - STOMP protocol implementation
- `sockjs-client` - SockJS client for WebSocket fallback
- `@types/sockjs-client` - TypeScript definitions

## Installation

The required dependencies are already installed in the project:

```bash
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

## Usage

### Basic Connection

```typescript
import { IndicesWebSocketService } from './services/websockets';

constructor(private indicesWs: IndicesWebSocketService) {}

async ngOnInit() {
  // Connect to WebSocket
  await this.indicesWs.connect();
}
```

### Subscribe to All Indices

```typescript
// Subscribe to all indices data
this.indicesWs.subscribeToAllIndices().subscribe(data => {
  console.log('All indices data:', data);
  // Handle the data...
});
```

### Subscribe to Specific Index

```typescript
// Subscribe to NIFTY 50 data
this.indicesWs.subscribeToIndex('NIFTY-50').subscribe(data => {
  console.log('NIFTY 50 data:', data);
  // Handle the data...
});
```

### Connection State Monitoring

```typescript
// Monitor connection state
this.indicesWs.connectionState.subscribe(state => {
  console.log('Connection state:', state);
  // Handle connection state changes...
});

// Monitor errors
this.indicesWs.errors.subscribe(error => {
  console.error('WebSocket error:', error);
  // Handle errors...
});
```

### Unsubscribing

```typescript
// Unsubscribe from all indices
this.indicesWs.unsubscribeFromAllIndices();

// Unsubscribe from specific index
this.indicesWs.unsubscribeFromIndex('NIFTY-50');

// Disconnect entirely
await this.indicesWs.disconnect();
```

## WebSocket Endpoints

The service connects to the following backend endpoints:

### Connection
- **URL**: `/ws/indices`
- **Protocol**: STOMP over SockJS

### Subscriptions
1. **All Indices**: `/topic/indices`
2. **Specific Index**: `/topic/indices/{indexName}` (e.g., `/topic/indices/nifty-50`)

### Unsubscribe Messages
1. **All Indices**: `/app/unsubscribe-indices`
2. **Specific Index**: `/app/unsubscribe-indices/{indexName}`

## Data Structure

### IndicesDto
Main data structure received from WebSocket:

```typescript
interface IndicesDto {
  timestamp?: string;
  indices?: IndexDataDto[];
  marketStatus?: MarketStatusDto;
  source?: string;
}
```

### IndexDataDto
Individual index data:

```typescript
interface IndexDataDto {
  indexName?: string;
  indexSymbol?: string;
  lastPrice?: number;
  variation?: number;
  percentChange?: number;
  openPrice?: number;
  dayHigh?: number;
  dayLow?: number;
  // ... more fields
}
```

### MarketStatusDto
Market status information:

```typescript
interface MarketStatusDto {
  status?: string;
  message?: string;
  tradeDate?: string;
  marketStatusTime?: string;
  // ... more fields
}
```

## Connection States

The service provides the following connection states:

- `CONNECTING` - Establishing connection
- `CONNECTED` - Successfully connected
- `DISCONNECTED` - Not connected
- `ERROR` - Connection error
- `RECONNECTING` - Attempting to reconnect

## Features

### Smart Connection Management
- Lazy connection (connects only when needed)
- Automatic reconnection with configurable attempts
- Graceful disconnect and cleanup

### Subscription Tracking
- Tracks active subscriptions
- Prevents duplicate subscriptions
- Automatic cleanup on disconnect

### Error Handling
- Comprehensive error reporting
- Connection state monitoring
- Graceful fallback behavior

### Type Safety
- Full TypeScript support
- Interfaces matching backend DTOs
- Compile-time type checking

## Testing

Use the `IndicesWebSocketDemoComponent` to test the WebSocket functionality:

```typescript
// Add to your routing or component
import { IndicesWebSocketDemoComponent } from './services/websockets/indices-websocket-demo.component';

// Use in template
<app-indices-websocket-demo></app-indices-websocket-demo>
```

The demo component provides:
- Connection controls
- Subscription management
- Real-time data display
- Error monitoring

## Configuration

### Debug Mode
```typescript
// Enable debug logging
this.indicesWs.enableDebug();

// Disable debug logging
this.indicesWs.disableDebug();
```

### Reconnection Settings
```typescript
// Access base service for advanced configuration
const baseService = // inject BaseWebSocketService
baseService.setMaxReconnectAttempts(10);
baseService.setReconnectInterval(3000); // 3 seconds
```

## Best Practices

1. **Always handle errors**: Subscribe to the errors observable
2. **Monitor connection state**: Check connection before subscribing
3. **Clean up subscriptions**: Unsubscribe in ngOnDestroy
4. **Use lazy connection**: Connect only when needed
5. **Handle reconnection**: Implement retry logic for failed connections

## Integration with Components

### In Services
```typescript
@Injectable({
  providedIn: 'root'
})
export class MyDataService {
  constructor(private indicesWs: IndicesWebSocketService) {}
  
  async startListening() {
    await this.indicesWs.connect();
    return this.indicesWs.subscribeToAllIndices();
  }
}
```

### In Components
```typescript
@Component({...})
export class MyComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  
  constructor(private indicesWs: IndicesWebSocketService) {}
  
  async ngOnInit() {
    try {
      await this.indicesWs.connect();
      
      this.subscriptions.push(
        this.indicesWs.subscribeToAllIndices().subscribe(data => {
          // Handle data...
        })
      );
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.indicesWs.disconnect();
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Fails**
   - Check if backend is running
   - Verify WebSocket endpoint URL
   - Check network connectivity

2. **No Data Received**
   - Ensure subscription is active
   - Check if backend has data
   - Verify endpoint paths match backend

3. **Memory Leaks**
   - Always unsubscribe in ngOnDestroy
   - Disconnect WebSocket when not needed
   - Clean up observables properly

### Debug Tips

1. Enable debug mode for detailed logs
2. Monitor connection state changes
3. Check browser's WebSocket connections in DevTools
4. Use the demo component for testing