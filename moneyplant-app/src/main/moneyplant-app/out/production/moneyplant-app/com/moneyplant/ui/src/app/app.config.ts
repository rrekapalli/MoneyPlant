import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { GlobalErrorHandler } from './core/error-handler';
import { csrfInterceptor } from './services/security';

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
          preset: Aura
      }
    }),
    { 
      provide: ErrorHandler, 
      useClass: GlobalErrorHandler 
    }
  ]
};
