# MoneyPlant API Service Layer

This directory contains the service layer for the MoneyPlant application, which provides a consistent approach for making API calls.

## Architecture

The service layer follows a hierarchical structure:

1. **ApiService**: Base service that handles HTTP requests and error handling
2. **Feature Services**: Services for specific features (watchlists, holdings, market, positions)

## Base API Service

The `ApiService` provides common HTTP methods with error handling:

- `get<T>(path: string, params?: HttpParams): Observable<T>`
- `post<T>(path: string, body: any): Observable<T>`
- `put<T>(path: string, body: any): Observable<T>`
- `delete<T>(path: string): Observable<T>`

## Feature Services

Each feature service encapsulates the API calls for a specific domain:

- **WatchlistService**: Manages watchlists and their symbols
- **HoldingsService**: Manages holding groups and their holdings
- **MarketService**: Provides market data and stock information
- **PositionsService**: Manages trading positions

## Usage

### Importing Services

Services can be imported from the barrel file:

```typescript
import { WatchlistService, Watchlist } from '../../services';
```

### Using Services in Components

Inject the service in the component constructor:

```typescript
constructor(private watchlistService: WatchlistService) {}
```

Make API calls using the service methods:

```typescript
this.watchlistService.getWatchlists().subscribe({
  next: (data) => {
    this.watchlists = data;
  },
  error: (error) => {
    console.error('Error loading watchlists', error);
  }
});
```

## Creating New Services

To create a new feature service:

1. Create a new file in the `services` directory (e.g., `new-feature.service.ts`)
2. Define interfaces for the data models
3. Create a service class that extends or uses the `ApiService`
4. Export the service and interfaces from the barrel file (`index.ts`)

Example:

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface NewFeatureData {
  // Define properties
}

@Injectable({
  providedIn: 'root'
})
export class NewFeatureService {
  private readonly endpoint = '/new-feature';

  constructor(private apiService: ApiService) {}

  getData(): Observable<NewFeatureData[]> {
    return this.apiService.get<NewFeatureData[]>(this.endpoint);
  }

  // Add other methods
}
```

Then add to `index.ts`:

```typescript
export * from './new-feature.service';
```