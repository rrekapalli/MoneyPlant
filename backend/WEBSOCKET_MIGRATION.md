# WebSocket Migration to Engines Project

## Overview
All WebSocket functionality has been moved from the backend project to the engines project. The backend now only provides REST API endpoints for data access.

## Changes Made

### 1. Dependencies Removed
- Removed `spring-boot-starter-websocket` dependency from `pom.xml`

### 2. Configuration Files Modified
- **SecurityConfig.java**: Removed `/ws/**` endpoint permissions
- **application-dev.properties**: Removed `spring.websocket.enabled=true` configuration

### 3. Files Deleted
- **WebSocketConfig.java**: Complete WebSocket configuration class removed

### 4. Controllers Modified

#### StockTicksController.java
- Removed all WebSocket annotations (`@SubscribeMapping`, `@MessageMapping`)
- Removed WebSocket subscription/unsubscription methods
- Converted to pure REST controller with `@RestController` annotation
- Kept existing REST endpoints for data retrieval

#### IndicesController.java
- Removed all WebSocket annotations (`@SubscribeMapping`, `@MessageMapping`)
- Removed WebSocket subscription/unsubscription methods
- Converted to pure REST controller
- Added new REST endpoints:
  - `GET /api/v1/indices/{indexName}` - Get specific index data
  - `GET /api/v1/indices` - Get all indices data
  - `GET /api/v1/indices/status` - Check service status
  - `GET /api/v1/indices/available` - Get list of available indices

### 5. Services Modified

#### StockTicksService.java
- Removed `SimpMessagingTemplate` dependency
- Removed subscription management (`subscribeToStockTicks`, `unsubscribeFromStockTicks`)
- Removed scheduled broadcasting methods
- Removed WebSocket message broadcasting
- Kept core data access methods for database queries

#### IndicesService.java
- Completely rewritten to remove all WebSocket functionality
- Removed NSE WebSocket client connections
- Removed subscription management
- Removed real-time data streaming
- Now only provides database data access methods

## Current Functionality

### Backend (REST Only)
- **Stock Ticks**: REST endpoints for retrieving stock data from database
- **Indices**: REST endpoints for retrieving indices data from database
- **Data Source**: Database only (no real-time streaming)

### Engines Project (WebSocket)
- **WebSocket Configuration**: `/ws/engines` and `/ws/nse-indices` endpoints
- **Real-time Data**: NSE indices streaming and other real-time data
- **Subscription Management**: WebSocket subscription/unsubscription logic

## Migration Notes

1. **Frontend Changes Required**: Update frontend to connect to engines project WebSocket endpoints instead of backend
2. **Real-time Data**: All real-time data streaming now comes from engines project
3. **Database Access**: Backend still provides access to historical and current data via REST APIs
4. **Performance**: Backend is now lighter and focused on data persistence and REST API delivery

## API Endpoints

### Stock Ticks
- `GET /api/v1/stock-ticks/{indexName}` - Get stock ticks for specific index
- `GET /api/v1/stock-ticks/by-index/{selectedIndex}` - Get enriched stock ticks data
- `GET /api/v1/stock-ticks/indices` - Get available indices list

### Indices
- `GET /api/v1/indices/{indexName}` - Get specific index data
- `GET /api/v1/indices` - Get all indices data
- `GET /api/v1/indices/status` - Check service status
- `GET /api/v1/indices/available` - Get available indices list

## WebSocket Endpoints (Engines Project)
- `/ws/engines` - General engines WebSocket endpoint
- `/ws/nse-indices` - NSE indices WebSocket endpoint
- `/ws/engines-native` - Native WebSocket support
- `/ws/nse-indices-native` - Native WebSocket support for NSE indices
