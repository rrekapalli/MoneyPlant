# Installation and Setup Guide

This guide provides detailed instructions for installing and setting up the Criteria Builder UI Library in your Angular application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Module Setup](#module-setup)
- [Styles Configuration](#styles-configuration)
- [API Backend Setup](#api-backend-setup)
- [Basic Usage](#basic-usage)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Angular**: 20.0.0 or higher
- **TypeScript**: 5.0.0 or higher

### Check Your Environment

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Angular CLI version
ng version
```

### Angular Project Requirements

Your Angular project must be using:
- Angular v20 or higher
- TypeScript 5.0+
- Modern browser targets (ES2022+)

## Installation

### Step 1: Install the Library

```bash
npm install @projects/criteria-builder
```

### Step 2: Install Peer Dependencies

The library requires several peer dependencies. Install them all at once:

```bash
npm install @angular/common@^20.0.0 @angular/core@^20.0.0 @angular/forms@^20.0.0 @angular/cdk@^20.0.0 primeng@^20.0.0 primeicons@^7.0.0 primeflex@^4.0.0 rxjs@~7.8.0
```

### Step 3: Verify Installation

Check that all packages are installed correctly:

```bash
npm list @projects/criteria-builder
npm list primeng
npm list @angular/cdk
```

## Module Setup

### Step 1: Import the Module

In your `app.module.ts` or feature module:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import the Criteria Builder module
import { CriteriaBuilderModule } from '@projects/criteria-builder';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,    // Required for PrimeNG animations
    ReactiveFormsModule,        // Required for form integration
    HttpClientModule,           // Required for API calls
    CriteriaBuilderModule       // Add the Criteria Builder module
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Step 2: Standalone Component Setup (Angular 14+)

If using standalone components:

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CriteriaBuilderModule, CriteriaDSL } from '@projects/criteria-builder';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CriteriaBuilderModule
  ],
  template: `
    <ac-criteria-builder [formControl]="criteriaControl"></ac-criteria-builder>
  `
})
export class ExampleComponent {
  criteriaControl = new FormControl<CriteriaDSL | null>(null);
}
```

## Styles Configuration

### Method 1: Angular.json Configuration (Recommended)

Add the required styles to your `angular.json` file:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/primeng/resources/themes/saga-blue/theme.css",
              "node_modules/primeng/resources/primeng.min.css",
              "node_modules/primeicons/primeicons.css",
              "node_modules/primeflex/primeflex.css",
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}
```

### Method 2: Global Styles Import

In your `src/styles.scss` file:

```scss
// PrimeNG Theme (choose one)
@import 'primeng/resources/themes/saga-blue/theme.css';
// @import 'primeng/resources/themes/lara-light-blue/theme.css';
// @import 'primeng/resources/themes/arya-blue/theme.css';

// PrimeNG Core Styles
@import 'primeng/resources/primeng.min.css';

// PrimeIcons
@import 'primeicons/primeicons.css';

// PrimeFlex Utilities
@import 'primeflex/primeflex.css';

// Optional: Custom theme overrides
:root {
  --criteria-field-color: #2196f3;
  --criteria-operator-color: #9e9e9e;
  --criteria-value-color: #4caf50;
  --criteria-function-color: #9c27b0;
  --criteria-group-color: #ff9800;
}
```

### Method 3: Component-Level Styles

For component-specific styling:

```scss
// In your component.scss
@import 'primeng/resources/themes/saga-blue/theme.css';
@import 'primeng/resources/primeng.min.css';
@import 'primeicons/primeicons.css';

// Component-specific overrides
.criteria-container {
  .ac-criteria-builder {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
  }
}
```

### Available Themes

PrimeNG offers many themes. Popular options:

```scss
// Light themes
@import 'primeng/resources/themes/saga-blue/theme.css';
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/themes/nova-light/theme.css';

// Dark themes
@import 'primeng/resources/themes/arya-blue/theme.css';
@import 'primeng/resources/themes/lara-dark-blue/theme.css';
@import 'primeng/resources/themes/nova-dark/theme.css';
```

## API Backend Setup

The library requires backend API endpoints for dynamic functionality.

### Required Endpoints

Your backend must implement these REST endpoints:

```
GET    /api/screeners/criteria/fields
GET    /api/screeners/criteria/functions
GET    /api/screeners/criteria/functions/{id}/signature
GET    /api/screeners/criteria/fields/{id}/operators
GET    /api/screeners/criteria/fields/{id}/suggestions
POST   /api/screeners/criteria/validate
POST   /api/screeners/criteria/sql
```

### Example Backend Implementation (Node.js/Express)

```javascript
// Example API endpoints
app.get('/api/screeners/criteria/fields', (req, res) => {
  res.json([
    {
      id: 'price',
      label: 'Price',
      dbColumn: 'current_price',
      dataType: 'currency',
      category: 'Financial'
    },
    {
      id: 'volume',
      label: 'Volume',
      dbColumn: 'daily_volume',
      dataType: 'number',
      category: 'Trading'
    }
  ]);
});

app.get('/api/screeners/criteria/functions', (req, res) => {
  res.json([
    {
      id: 'sma',
      label: 'Simple Moving Average',
      returnType: 'number',
      category: 'Technical Analysis',
      description: 'Calculates simple moving average',
      examples: ['SMA(close, 20)'],
      paramCount: 2
    }
  ]);
});

app.post('/api/screeners/criteria/validate', (req, res) => {
  const { dsl } = req.body;
  // Implement validation logic
  res.json({
    isValid: true,
    errors: [],
    warnings: []
  });
});

app.post('/api/screeners/criteria/sql', (req, res) => {
  const { dsl } = req.body;
  // Implement SQL generation logic
  res.json({
    sql: 'WHERE price > :p1',
    parameters: { p1: 100 },
    generatedAt: new Date().toISOString()
  });
});
```

### API Configuration

Configure the API base URL in your environment:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

### HTTP Interceptor Setup

Add authentication and error handling:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Add authentication headers
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    return next.handle(authReq);
  }
  
  private getAuthToken(): string {
    // Return your auth token
    return localStorage.getItem('auth_token') || '';
  }
}

// Register in app.module.ts
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ApiInterceptor,
    multi: true
  }
]
```

## Basic Usage

### Simple Implementation

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CriteriaDSL, BuilderConfig } from '@projects/criteria-builder';

@Component({
  selector: 'app-criteria-example',
  template: `
    <div class="criteria-container">
      <h2>Build Your Criteria</h2>
      
      <ac-criteria-builder
        [formControl]="criteriaControl"
        [config]="builderConfig"
        (validityChange)="onValidityChange($event)"
        (sqlPreviewChange)="onSqlPreviewChange($event)">
      </ac-criteria-builder>
      
      <div class="actions" *ngIf="isValid">
        <button (click)="saveCriteria()">Save Criteria</button>
        <button (click)="clearCriteria()">Clear</button>
      </div>
      
      <div class="sql-output" *ngIf="generatedSql">
        <h3>Generated SQL:</h3>
        <pre>{{ generatedSql }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .criteria-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .actions {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }
    
    .sql-output {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    pre {
      white-space: pre-wrap;
      word-break: break-word;
    }
  `]
})
export class CriteriaExampleComponent {
  criteriaControl = new FormControl<CriteriaDSL | null>(null);
  isValid = false;
  generatedSql = '';
  
  builderConfig: BuilderConfig = {
    allowGrouping: true,
    maxDepth: 5,
    enableAdvancedFunctions: true,
    showSqlPreview: true,
    debounceMs: 200
  };
  
  onValidityChange(isValid: boolean) {
    this.isValid = isValid;
    console.log('Criteria validity changed:', isValid);
  }
  
  onSqlPreviewChange(result: { sql: string; params: Record<string, any> }) {
    this.generatedSql = result.sql;
    console.log('Generated SQL:', result.sql);
    console.log('Parameters:', result.params);
  }
  
  saveCriteria() {
    if (this.isValid && this.criteriaControl.value) {
      console.log('Saving criteria:', this.criteriaControl.value);
      // Implement save logic
    }
  }
  
  clearCriteria() {
    this.criteriaControl.setValue(null);
  }
}
```

## Verification

### Step 1: Build and Serve

```bash
# Build your application
ng build

# Serve your application
ng serve
```

### Step 2: Check Browser Console

Open browser developer tools and check for:
- No JavaScript errors
- Successful API calls to your backend
- Proper component rendering

### Step 3: Test Basic Functionality

1. **Component Renders**: The criteria builder appears on the page
2. **Dropdowns Work**: Clicking tokens opens dropdown menus
3. **API Integration**: Fields and functions load from your API
4. **Form Integration**: Changes update the form control value
5. **Validation**: Invalid criteria show error states
6. **SQL Generation**: Valid criteria generate SQL preview

### Step 4: Accessibility Check

```bash
# Install accessibility testing tools
npm install -g @axe-core/cli

# Run accessibility audit
axe http://localhost:4200
```

## Troubleshooting

### Common Issues

#### 1. Component Not Displaying

**Problem**: The `<ac-criteria-builder>` element is empty.

**Solutions**:
```typescript
// Check module import
@NgModule({
  imports: [
    CriteriaBuilderModule, // ✅ Must be imported
    ReactiveFormsModule,   // ✅ Required for forms
    // ...
  ]
})

// Check component usage
<ac-criteria-builder [formControl]="criteriaControl"></ac-criteria-builder>
```

#### 2. Styles Not Loading

**Problem**: Component appears unstyled.

**Solutions**:
```bash
# Verify PrimeNG styles are included
# Check browser Network tab for 404 errors on CSS files
# Ensure angular.json includes the style imports
```

#### 3. API Errors

**Problem**: Fields/functions not loading.

**Solutions**:
```typescript
// Check API endpoints are accessible
// Verify CORS configuration
// Check authentication headers
// Look for network errors in browser dev tools
```

#### 4. Form Integration Issues

**Problem**: FormControl not working.

**Solutions**:
```typescript
// Ensure ReactiveFormsModule is imported
// Use proper FormControl typing
const criteriaControl = new FormControl<CriteriaDSL | null>(null);

// Check template binding
<ac-criteria-builder [formControl]="criteriaControl"></ac-criteria-builder>
```

### Debug Mode

Enable debug logging:

```typescript
// In main.ts or app.component.ts
if (!environment.production) {
  localStorage.setItem('criteria-builder-debug', 'true');
}
```

### Getting Help

If you encounter issues:

1. **Check the [Troubleshooting Guide](TROUBLESHOOTING.md)**
2. **Review the [FAQ](FAQ.md)**
3. **Search [GitHub Issues](https://github.com/your-org/criteria-builder-ui/issues)**
4. **Create a new issue** with:
   - Angular version (`ng version`)
   - Library version
   - Browser and version
   - Steps to reproduce
   - Console errors

## Next Steps

After successful installation:

1. **Read the [API Documentation](API.md)** for detailed interface information
2. **Review [Security Guidelines](SECURITY.md)** for production deployment
3. **Check [Accessibility Features](ACCESSIBILITY.md)** for inclusive design
4. **Explore [Import/Export](IMPORT_EXPORT.md)** for preset management
5. **See [Contributing Guide](CONTRIBUTING.md)** to contribute back

## Production Deployment

For production deployment:

1. **Enable production mode** in Angular
2. **Configure proper API endpoints** with HTTPS
3. **Set up authentication** and authorization
4. **Implement proper error handling**
5. **Test accessibility** with real assistive technologies
6. **Monitor performance** and optimize as needed
7. **Review security guidelines** and implement recommendations

Congratulations! You now have the Criteria Builder UI Library successfully installed and configured in your Angular application.