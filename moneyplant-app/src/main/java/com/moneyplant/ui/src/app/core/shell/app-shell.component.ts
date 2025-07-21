import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../header/app-header.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { WatchlistComponent } from '../../features/watchlists/watchlist.component';
import { FeatureFlagDirective } from '../../core/directives';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AppHeaderComponent,
    ProgressSpinnerModule,
    WatchlistComponent,
    FeatureFlagDirective,
    ToastModule
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  providers: [MessageService]
})
export class AppShellComponent implements OnInit, OnDestroy {
  loading = false; // This will be used to control the loading spinner visibility
  private toastSubscription: Subscription | undefined;

  constructor(
    private messageService: MessageService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.toastSubscription = this.toastService.toast$.subscribe(toast => {
      this.messageService.add(toast);
    });
  }

  ngOnDestroy(): void {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
  }
}
