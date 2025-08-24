# Portfolios Feature

This feature provides a comprehensive portfolio management interface using PrimeNG's DataView component, similar to the analytics dashboard design.

## Features

### 1. Summary Cards
- **Total Portfolios**: Shows the total number of portfolios
- **Active Portfolios**: Displays count of active portfolios
- **Risk Profile Breakdown**: Shows counts for Conservative, Moderate, and Aggressive portfolios

### 2. Search and Filtering
- **Search**: Text-based search across portfolio names and descriptions
- **Risk Profile Filter**: Dropdown to filter by risk profile (Conservative, Moderate, Aggressive)
- **Clear Filters**: Button to reset all filters

### 3. DataView Component
- **List View**: Detailed portfolio information with action buttons
- **Grid View**: Card-based layout for compact viewing
- **Sorting**: Sort by name, risk profile, or inception date
- **Pagination**: Built-in pagination with configurable rows per page

### 4. Portfolio Actions
- **View Data**: Access portfolio performance data and analytics
- **Insights**: View portfolio insights and recommendations
- **Configure**: Modify portfolio settings and allocations
- **Edit**: Update portfolio details
- **Create**: Add new portfolios

## Current Status

### ✅ **What's Working:**
- Complete UI implementation with PrimeNG DataView
- Mock data fallback for development
- Search, filtering, and sorting functionality
- Responsive design with list and grid views
- Error handling and loading states

### ⚠️ **Known Issues:**
- **Authentication Required**: The backend portfolio endpoints require JWT authentication
- **404 Error**: Frontend receives 404 when calling `/api/v1/portfolio` without valid token

### 🔧 **Development Solutions:**

#### Option 1: Use Mock Data (Current)
The component automatically falls back to mock data when the API call fails, allowing you to see and test the UI functionality.

#### Option 2: Enable Authentication
1. **Start the backend server** with proper environment variables
2. **Implement login flow** in the frontend
3. **Get valid JWT token** from the backend
4. **Token is automatically added** to API requests via the auth interceptor

#### Option 3: Temporary Security Bypass (Development Only)
For development purposes, you can temporarily modify the backend security configuration to allow unauthenticated access to portfolio endpoints.

## API Integration

### Backend Endpoints
- `GET /api/v1/portfolio` - List all portfolios
- `GET /api/v1/portfolio/{id}` - Get specific portfolio
- `POST /api/v1/portfolio` - Create new portfolio
- `PUT /api/v1/portfolio/{id}` - Update portfolio
- `PATCH /api/v1/portfolio/{id}` - Partial update
- `DELETE /api/v1/portfolio/{id}` - Delete portfolio

### Data Structure
The component expects `PortfolioDto` objects with the following structure:
```typescript
interface PortfolioDto {
  id: number;
  name: string;
  description: string;
  baseCurrency: string;
  inceptionDate: string;
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  isActive: boolean;
}
```

## Usage

### Basic Implementation
```typescript
import { PortfoliosComponent } from './features/portfolios/portfolios.component';

// Add to your routing
{
  path: 'portfolios',
  loadComponent: () => import('./features/portfolios/portfolios.component')
    .then(m => m.PortfoliosComponent)
}
```

### Customization
- Modify the mock data in the component for different sample portfolios
- Adjust the styling by modifying the SCSS file
- Add additional filters or sorting options as needed

## Troubleshooting

### Console Errors
If you see `GET http://localhost:8080/api/v1/portfolio 404 (Not Found)`:
1. Check if the backend server is running on port 8080
2. Verify that the portfolio endpoints are properly configured
3. Ensure you have a valid JWT token for authentication

### Mock Data Fallback
The component automatically shows mock data when the API fails, so you can still test the UI functionality even without backend connectivity.

## Future Enhancements
- Portfolio creation/editing dialogs
- Advanced filtering options
- Portfolio templates and cloning
- Real-time portfolio updates via WebSocket
- Portfolio performance charts and analytics
- Export functionality for portfolio data
