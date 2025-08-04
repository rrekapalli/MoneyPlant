import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { GlobalErrorHandler } from './core/error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    provideHttpClient(),
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
