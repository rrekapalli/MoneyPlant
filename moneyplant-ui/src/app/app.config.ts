import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Nora from '@primeng/themes/nora';
import Lara from '@primeng/themes/lara';
import { GlobalErrorHandler } from './core/error-handler';
import { csrfInterceptor } from './services/security';
import { provideEchartsCore } from 'ngx-echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    provideHttpClient(
      withInterceptors([
        // Add HTTP interceptors here
        csrfInterceptor
      ])
    ),
    provideNoopAnimations(),
    providePrimeNG({
      theme: {
          preset: Lara
      }
    }),
    // Provide ECharts globally for ngx-echarts
    provideEchartsCore({
      echarts: () => import('echarts'),
    }),
    { 
      provide: ErrorHandler, 
      useClass: GlobalErrorHandler 
    }
  ]
};
