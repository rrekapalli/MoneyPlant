import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ScreenerStateService } from '../../services/state/screener.state';
import { ScreenerApiService } from '../../services/apis/screener.api';
import { ScreenerResp, ScreenerCreateReq } from '../../services/entities/screener.entities';

@Component({
  selector: 'app-screeners',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TabsModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    InputTextModule,
    PaginatorModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
    MessageModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './screeners.component.html',
  styleUrl: './screeners.component.scss'
})
export class ScreenersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State
  screeners: ScreenerResp[] = [];
  myScreeners: ScreenerResp[] = [];
  publicScreeners: ScreenerResp[] = [];
  starredScreeners: ScreenerResp[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';
  
  // Pagination
  pagination = {
    page: 0,
    size: 25,
    totalElements: 0,
    totalPages: 0
  };

  // UI State
  showCreateDialog = false;
  showEditDialog = false;
  selectedScreener: ScreenerResp | null = null;
  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false,
    defaultUniverse: ''
  };

  // Define tabs for the new p-tabs component
  tabs = [
    { label: 'All Screeners', value: 'all' },
    { label: 'My Screeners', value: 'my' },
    { label: 'Public Screeners', value: 'public' },
    { label: 'Starred Screeners', value: 'starred' }
  ];
  activeTab = 'all';

  constructor(
    private screenerState: ScreenerStateService,
    private screenerApi: ScreenerApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
    // Subscribe to state changes
    combineLatest([
      this.screenerState.screeners$,
      this.screenerState.myScreeners$,
      this.screenerState.publicScreeners$,
      this.screenerState.starredScreeners$,
      this.screenerState.loading$,
      this.screenerState.error$,
      this.screenerState.pagination$
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([screeners, myScreeners, publicScreeners, starredScreeners, loading, error, pagination]) => {
      this.screeners = screeners;
      this.myScreeners = myScreeners;
      this.publicScreeners = publicScreeners;
      this.starredScreeners = starredScreeners;
      this.loading = loading;
      this.error = error;
      this.pagination = pagination;
    });
  }

  private loadInitialData() {
    this.loadScreeners();
    this.loadMyScreeners();
    this.loadPublicScreeners();
    this.loadStarredScreeners();
  }

  loadScreeners() {
    const params = {
      q: this.searchQuery || undefined,
      page: this.pagination.page,
      size: this.pagination.size
    };
    this.screenerState.loadScreeners(params).subscribe();
  }

  loadMyScreeners() {
    this.screenerState.loadMyScreeners().subscribe();
  }

  loadPublicScreeners() {
    this.screenerState.loadPublicScreeners().subscribe();
  }

  loadStarredScreeners() {
    this.screenerState.loadStarredScreeners().subscribe();
  }

  onSearch() {
    this.pagination.page = 0; // Reset to first page
    this.loadScreeners();
  }

  onPageChange(event: any) {
    this.pagination.page = event.page;
    this.pagination.size = event.rows;
    this.loadScreeners();
  }

  onTabChange(tab: any) {
    this.activeTab = tab.value;
  }

  getCurrentScreeners(): ScreenerResp[] {
    switch (this.activeTab) {
      case 'my':
        return this.myScreeners;
      case 'public':
        return this.publicScreeners;
      case 'starred':
        return this.starredScreeners;
      default:
        return this.screeners;
    }
  }

  runScreener(screener: ScreenerResp) {
    console.log('Running screener', screener);
    // TODO: Implement run screener functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Screener Run',
      detail: `Running screener: ${screener.name}`
    });
  }

  viewResults(screener: ScreenerResp) {
    this.router.navigate(['/screeners', screener.screenerId]);
  }

  createScreener() {
    this.router.navigate(['/screeners/new']);
  }

  editScreener(screener: ScreenerResp) {
    this.router.navigate(['/screeners', screener.screenerId, 'edit']);
  }

  deleteScreener(screener: ScreenerResp) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${screener.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.screenerState.deleteScreener(screener.screenerId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Screener deleted successfully'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete screener'
            });
          }
        });
      }
    });
  }

  saveScreener() {
    if (this.selectedScreener) {
      this.updateScreener();
    } else {
      this.createNewScreener();
    }
  }

  private createNewScreener() {
    this.screenerState.createScreener(this.screenerForm).subscribe({
      next: () => {
        this.showCreateDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener created successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create screener'
        });
      }
    });
  }

  private updateScreener() {
    if (!this.selectedScreener) return;

    this.screenerState.updateScreener(this.selectedScreener.screenerId, this.screenerForm).subscribe({
      next: () => {
        this.showEditDialog = false;
        this.selectedScreener = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener updated successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update screener'
        });
      }
    });
  }

  toggleStar(screener: ScreenerResp) {
    const isStarred = this.starredScreeners.some(s => s.screenerId === screener.screenerId);
    this.screenerState.toggleStar(screener.screenerId, !isStarred).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: isStarred ? 'Removed from starred' : 'Added to starred'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle star'
        });
      }
    });
  }

  isStarred(screener: ScreenerResp): boolean {
    return this.starredScreeners.some(s => s.screenerId === screener.screenerId);
  }

  cancelDialog() {
    this.showCreateDialog = false;
    this.showEditDialog = false;
    this.selectedScreener = null;
    this.screenerForm = {
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: ''
    };
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'ARCHIVED':
        return 'danger';
      default:
        return 'info';
    }
  }
}
