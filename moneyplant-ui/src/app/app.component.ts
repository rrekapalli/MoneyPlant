import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  // Root component now only serves as an entry point for the router
}
