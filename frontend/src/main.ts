import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Enable production mode to disable development warnings
enableProdMode();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));