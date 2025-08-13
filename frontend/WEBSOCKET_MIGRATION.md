# Frontend WebSocket Migration to Engines Project

## Overview
All WebSocket connections in the frontend have been updated to connect to the engines project instead of the backend. The backend no longer provides WebSocket endpoints, only REST API endpoints.

## Changes Made

### 1. Environment Configuration Updated
- **environment.ts**: Added `enginesWebSocketUrl: 'ws://localhost:8081/engines'`
- **environment.prod.ts**: Added `enginesWebSocketUrl: '/engines'`

### 2. WebSocket Services Updated

#### EnginesWebSocketService
- **File**: `src/app/services/websockets/engines-websocket.service.ts`
- **Changes**: 
  - Updated WebSocket URL to use engines endpoints: `/ws/nse-indices-native`
  - Updated logging to reflect engines connection
  - Enhanced message handling for engines data format

#### NativeIndicesWebSocketService
- **File**: `src/app/services/websockets/native-indices-websocket.service.ts`
- **Changes**:
  - Updated base URL to use engines: `${environment.enginesWebSocketUrl}/ws/nse-indices-native`
  - Updated all logging and error messages to reflect engines connection
  - Enhanced data parsing for engines message format

#### StompNativeWebSocketService
- **File**: `src/app/services/websockets/stomp-native-websocket.service.ts`
- **Changes**:
  - Updated WebSocket URL to use engines: `${environment.enginesWebSocketUrl}/ws/nse-indices`
  - Updated all logging and error messages to reflect engines connection
  - Enhanced data parsing for engines message format

#### StompSockJSWebSocketService
- **File**: `src/app/services/websockets/stomp-sockjs-websocket.service.ts`
- **Changes**:
  - Updated WebSocket URL to use engines: `${environment.enginesWebSocketUrl}/ws/nse-indices-native`
  - Updated all logging and error messages to reflect engines connection
  - Enhanced data parsing for engines message format

#### BaseWebSocketService
- **File**: `src/app/services/websockets/base-websocket.service.ts`
- **Changes**:
  - Updated default broker URL to use engines: `${environment.enginesWebSocketUrl}/ws/engines`
  - Updated all logging and error messages to reflect engines connection
  - Enhanced reconnection logic for engines endpoints

#### IndicesWebSocketService
- **File**: `src/app/services/websockets/indices-websocket.service.ts`
- **Changes**:
  - Updated base URL to use engines: `${environment.enginesWebSocketUrl}/ws/nse-indices`
  - Updated all logging and error messages to reflect engines connection
  - Simplified subscription management for engines endpoints

## New WebSocket Endpoints (Engines Project)

### STOMP Endpoints (with SockJS fallback)
- `/ws/engines` - General engines WebSocket endpoint
- `/ws/nse-indices` - NSE indices WebSocket endpoint

### Native WebSocket Endpoints
- `/ws/engines-native` - Native WebSocket support for engines
- `/ws/nse-indices-native` - Native WebSocket support for NSE indices

## Connection Details

### Development Environment
- **Engines WebSocket URL**: `ws://localhost:8081/engines`
- **Port**: 8081 (engines project)
- **Context Path**: `/engines`

### Production Environment
- **Engines WebSocket URL**: `/engines` (relative to same domain)
- **Port**: Same as frontend (typically 80/443)
- **Context Path**: `/engines`

## Data Flow Changes

### Before (Backend WebSockets)
```
Frontend → Backend (localhost:8080) → WebSocket endpoints
```

### After (Engines WebSockets)
```
Frontend → Engines (localhost:8081/engines) → WebSocket endpoints
```

## Message Format Updates

### Subscription Messages
All subscription messages now use the engines format:
```json
{
  "action": "subscribe",
  "channel": "nse-indices",
  "index": "NIFTY 50" // optional for specific index
}
```

### Unsubscription Messages
```json
{
  "action": "unsubscribe",
  "channel": "nse-indices",
  "index": "NIFTY 50" // optional for specific index
}
```

## Service Usage

### Components Using WebSockets
The following components have been updated to use engines WebSockets:
- **IndicesComponent**: Uses `EnginesWebSocketService` and `ModernIndicesWebSocketService`
- **Dashboard Overall Component**: Uses `ModernIndicesWebSocketService`
- **Demo Components**: Use various WebSocket services for testing

### Service Selection
- **For NSE Indices**: Use `EnginesWebSocketService` or `NativeIndicesWebSocketService`
- **For STOMP Protocol**: Use `StompNativeWebSocketService` or `StompSockJSWebSocketService`
- **For Generic WebSocket**: Use `BaseWebSocketService`

## Migration Benefits

### 1. Separation of Concerns
- **Backend**: Focuses on data persistence and REST APIs
- **Engines**: Handles real-time data streaming and WebSocket connections

### 2. Scalability
- WebSocket connections are now handled by dedicated engines service
- Backend can scale independently for REST API requests

### 3. Performance
- Real-time data processing is isolated in engines project
- Backend response times improved for REST API calls

### 4. Maintenance
- WebSocket logic centralized in engines project
- Easier to update real-time features without affecting backend

## Testing

### Local Development
1. Start engines project on port 8081
2. Start backend project on port 8080
3. Start frontend project on port 4200
4. Verify WebSocket connections to engines endpoints

### Connection Verification
Check browser console for:
- `Connected to engines WebSocket` messages
- WebSocket URLs pointing to `localhost:8081/engines`
- Successful data streaming from engines

## Troubleshooting

### Common Issues
1. **Connection Refused**: Ensure engines project is running on port 8081
2. **CORS Errors**: Verify engines CORS configuration allows frontend origin
3. **Data Not Received**: Check engines WebSocket endpoints are properly configured

### Debug Mode
Enable debug mode in WebSocket services by setting `debug: true` in service configurations.

## Future Considerations

### Additional Engines Endpoints
As the engines project grows, additional WebSocket endpoints may be added:
- Trading signals
- Market data streams
- Backtest results
- Strategy execution updates

### Load Balancing
For production deployments, consider:
- Load balancing WebSocket connections across multiple engines instances
- Health checks for engines WebSocket endpoints
- Circuit breakers for WebSocket connection failures
