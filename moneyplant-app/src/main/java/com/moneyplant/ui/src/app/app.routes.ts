import { Routes } from '@angular/router';
import { AppShellComponent } from './core/shell/app-shell.component';
import { featureFlagGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'portfolios',
        loadComponent: () => import('./features/portfolios/portfolios.component')
          .then(m => m.PortfoliosComponent),
        title: 'Portfolios - MoneyPlant',
        canActivate: [featureFlagGuard('portfolios')]
      },
      {
        path: 'portfolios/:id',
        loadComponent: () => import('./features/portfolios/portfolios.component')
          .then(m => m.PortfoliosComponent),
        title: 'Portfolio Details - MoneyPlant',
        canActivate: [featureFlagGuard('portfolios')]
      },
      {
        path: 'scanners',
        loadComponent: () => import('./features/scanners/scanners.component')
          .then(m => m.ScannersComponent),
        title: 'Stock Scanners - MoneyPlant',
        canActivate: [featureFlagGuard('scanners')]
      },
      {
        path: 'scanners/:id',
        loadComponent: () => import('./features/scanners/scanners.component')
          .then(m => m.ScannersComponent),
        title: 'Scanner Details - MoneyPlant',
        canActivate: [featureFlagGuard('scanners')]
      },
      {
        path: 'strategies',
        loadComponent: () => import('./features/strategies/strategies.component')
          .then(m => m.StrategiesComponent),
        title: 'Trading Strategies - MoneyPlant',
        canActivate: [featureFlagGuard('strategies')]
      },
      {
        path: 'strategies/:id',
        loadComponent: () => import('./features/strategies/strategies.component')
          .then(m => m.StrategiesComponent),
        title: 'Strategy Details - MoneyPlant',
        canActivate: [featureFlagGuard('strategies')]
      },
      {
        path: 'watchlists',
        loadComponent: () => import('./features/watchlists/watchlist.component')
          .then(m => m.WatchlistComponent),
        title: 'Watchlists - MoneyPlant',
        canActivate: [featureFlagGuard('watchlist')]
      },
      {
        path: 'watchlists/:id',
        loadComponent: () => import('./features/watchlists/watchlist.component')
          .then(m => m.WatchlistComponent),
        title: 'Watchlist Details - MoneyPlant',
        canActivate: [featureFlagGuard('watchlist')]
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        title: 'Dashboard - MoneyPlant',
        canActivate: [featureFlagGuard('dashboard')],
        children: [
          {
            path: '',
            redirectTo: 'overall',
            pathMatch: 'full'
          },
          {
            path: 'overall',
            loadComponent: () => import('./features/dashboard/overall/overall.component')
              .then(m => m.OverallComponent),
            title: 'Overall Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-overall')]
          },
          {
            path: 'today',
            loadComponent: () => import('./features/dashboard/today/today.component')
              .then(m => m.TodayComponent),
            title: 'Today Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-today')]
          },
          {
            path: 'week',
            loadComponent: () => import('./features/dashboard/this-week/this-week.component')
              .then(m => m.ThisWeekComponent),
            title: 'This Week Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-week')]
          },
          {
            path: 'month',
            loadComponent: () => import('./features/dashboard/this-month/this-month.component')
              .then(m => m.ThisMonthComponent),
            title: 'This Month Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-month')]
          },
          {
            path: 'year',
            loadComponent: () => import('./features/dashboard/this-year/this-year.component')
              .then(m => m.ThisYearComponent),
            title: 'This Year Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-year')]
          }
        ]
      },
      {
        path: 'holdings',
        loadComponent: () => import('./features/holdings/holdings.component')
          .then(m => m.HoldingsComponent),
        title: 'Holdings - MoneyPlant',
        canActivate: [featureFlagGuard('holdings')]
      },
      {
        path: 'holdings/:id',
        loadComponent: () => import('./features/holdings/holdings.component')
          .then(m => m.HoldingsComponent),
        title: 'Holdings Details - MoneyPlant',
        canActivate: [featureFlagGuard('holdings')]
      },
      {
        path: 'positions',
        loadComponent: () => import('./features/positions/positions.component')
          .then(m => m.PositionsComponent),
        title: 'Positions - MoneyPlant',
        canActivate: [featureFlagGuard('positions')]
      },
      {
        path: 'positions/:id',
        loadComponent: () => import('./features/positions/positions.component')
          .then(m => m.PositionsComponent),
        title: 'Position Details - MoneyPlant',
        canActivate: [featureFlagGuard('positions')]
      },
      {
        path: 'market',
        loadComponent: () => import('./features/market/market.component')
          .then(m => m.MarketComponent),
        title: 'Market - MoneyPlant',
        canActivate: [featureFlagGuard('market')]
      },
      {
        path: 'market/:id',
        loadComponent: () => import('./features/market/market.component')
          .then(m => m.MarketComponent),
        title: 'Market Details - MoneyPlant',
        canActivate: [featureFlagGuard('market')]
      },
      {
        path: '**',
        loadComponent: () => import('./features/not-found/not-found.component')
          .then(m => m.NotFoundComponent),
        title: 'Page Not Found - MoneyPlant'
      }
    ]
  }
];
