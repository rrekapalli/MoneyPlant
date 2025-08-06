import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IndicesWebSocketService } from './indices-websocket.service';
import { 
  IndicesDto, 
  IndexDataDto, 
  WebSocketConnectionState,
  WebSocketSubscription
} from '../entities/indices-websocket';
import { Subscription } from 'rxjs';

/**
 * Demo component for testing the Indices WebSocket service
 * This component demonstrates how to use the IndicesWebSocketService
 */
@Component({
  selector: 'app-indices-websocket-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
    TableModule,
    TagModule
  ],
  template: `
    <div class="p-4">
      <p-card header="Indices WebSocket Demo" class="mb-4">
        <div class="grid">
          <!-- Connection Controls -->
          <div class="col-12 md:col-6">
            <h3>Connection</h3>
            <div class="flex gap-2 mb-3">
              <p-button 
                label="Connect" 
                icon="pi pi-play"
                [disabled]="connectionState === 'CONNECTED' || connectionState === 'CONNECTING'"
                (onClick)="connect()"
                size="small">
              </p-button>
              <p-button 
                label="Disconnect" 
                icon="pi pi-stop"
                severity="secondary"
                [disabled]="connectionState === 'DISCONNECTED'"
                (onClick)="disconnect()"
                size="small">
              </p-button>
            </div>
            <p-message 
              severity="info" 
              text="Connection State: {{connectionState}}"
              class="w-full">
            </p-message>
            <p-message 
              *ngIf="lastError" 
              severity="error" 
              [text]="lastError"
              class="w-full mt-2">
            </p-message>
          </div>

          <!-- Subscription Controls -->
          <div class="col-12 md:col-6">
            <h3>Subscriptions</h3>
            <div class="flex gap-2 mb-2">
              <p-button 
                label="Subscribe All Indices" 
                icon="pi pi-plus"
                [disabled]="!isConnected || isSubscribedToAll"
                (onClick)="subscribeToAll()"
                size="small">
              </p-button>
              <p-button 
                label="Unsubscribe All" 
                icon="pi pi-minus"
                severity="secondary"
                [disabled]="!isSubscribedToAll"
                (onClick)="unsubscribeFromAll()"
                size="small">
              </p-button>
            </div>
            
            <div class="flex gap-2 mb-3">
              <input 
                pInputText 
                [(ngModel)]="indexNameInput" 
                placeholder="Index name (e.g., NIFTY-50)"
                class="flex-1">
              <p-button 
                label="Subscribe" 
                icon="pi pi-plus"
                [disabled]="!isConnected || !indexNameInput"
                (onClick)="subscribeToIndex()"
                size="small">
              </p-button>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Active Subscriptions -->
      <p-card header="Active Subscriptions" class="mb-4">
        <p-table [value]="activeSubscriptions" [responsive]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Type</th>
              <th>Destination</th>
              <th>Index Name</th>
              <th>Subscription Time</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-subscription>
            <tr>
              <td>
                <p-tag 
                  [value]="subscription.config.indexName ? 'Specific' : 'All'"
                  [severity]="subscription.config.indexName ? 'info' : 'success'">
                </p-tag>
              </td>
              <td>{{subscription.config.destination}}</td>
              <td>{{subscription.config.indexName || 'All Indices'}}</td>
              <td>{{subscription.subscriptionTime | date:'short'}}</td>
              <td>
                <p-button 
                  icon="pi pi-times"
                  severity="danger"
                  size="small"
                  (onClick)="unsubscribeSpecific(subscription)"
                  title="Unsubscribe">
                </p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">No active subscriptions</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- All Indices Data -->
      <p-card header="All Indices Data" class="mb-4" *ngIf="allIndicesData">
        <div class="grid">
          <div class="col-12 md:col-6">
            <p><strong>Timestamp:</strong> {{allIndicesData.timestamp}}</p>
            <p><strong>Source:</strong> {{allIndicesData.source}}</p>
            <p><strong>Total Indices:</strong> {{allIndicesData.indices?.length || 0}}</p>
          </div>
          <div class="col-12 md:col-6" *ngIf="allIndicesData.marketStatus">
            <p><strong>Market Status:</strong> {{allIndicesData.marketStatus.status}}</p>
            <p><strong>Trade Date:</strong> {{allIndicesData.marketStatus.tradeDate}}</p>
            <p><strong>Market Time:</strong> {{allIndicesData.marketStatus.marketStatusTime}}</p>
          </div>
        </div>

        <!-- Indices Table -->
        <p-table 
          [value]="allIndicesData.indices" 
          [paginator]="true" 
          [rows]="10"
          [responsive]="true"
          class="mt-3">
          <ng-template pTemplate="header">
            <tr>
              <th>Index Name</th>
              <th>Symbol</th>
              <th>Last Price</th>
              <th>Change</th>
              <th>% Change</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-index>
            <tr>
              <td>{{index.indexName}}</td>
              <td>{{index.indexSymbol}}</td>
              <td>{{index.lastPrice | number:'1.2-2'}}</td>
              <td>
                <span [class]="index.variation && index.variation >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{index.variation | number:'1.2-2'}}
                </span>
              </td>
              <td>
                <span [class]="index.percentChange && index.percentChange >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{index.percentChange | number:'1.2-2'}}%
                </span>
              </td>
              <td>{{index.openPrice | number:'1.2-2'}}</td>
              <td>{{index.dayHigh | number:'1.2-2'}}</td>
              <td>{{index.dayLow | number:'1.2-2'}}</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Specific Index Data -->
      <p-card header="Specific Index Data" *ngIf="specificIndexData">
        <div class="grid">
          <div class="col-12 md:col-6">
            <p><strong>Timestamp:</strong> {{specificIndexData.timestamp}}</p>
            <p><strong>Source:</strong> {{specificIndexData.source}}</p>
          </div>
          <div class="col-12 md:col-6" *ngIf="specificIndexData.marketStatus">
            <p><strong>Market Status:</strong> {{specificIndexData.marketStatus.status}}</p>
            <p><strong>Trade Date:</strong> {{specificIndexData.marketStatus.tradeDate}}</p>
          </div>
        </div>

        <div *ngFor="let index of specificIndexData.indices" class="mt-3">
          <h4>{{index.indexName}} ({{index.indexSymbol}})</h4>
          <div class="grid">
            <div class="col-12 md:col-4">
              <p><strong>Last Price:</strong> {{index.lastPrice | number:'1.2-2'}}</p>
              <p><strong>Change:</strong> 
                <span [class]="index.variation && index.variation >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{index.variation | number:'1.2-2'}}
                </span>
              </p>
              <p><strong>% Change:</strong> 
                <span [class]="index.percentChange && index.percentChange >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{index.percentChange | number:'1.2-2'}}%
                </span>
              </p>
            </div>
            <div class="col-12 md:col-4">
              <p><strong>Open:</strong> {{index.openPrice | number:'1.2-2'}}</p>
              <p><strong>High:</strong> {{index.dayHigh | number:'1.2-2'}}</p>
              <p><strong>Low:</strong> {{index.dayLow | number:'1.2-2'}}</p>
            </div>
            <div class="col-12 md:col-4">
              <p><strong>Previous Close:</strong> {{index.previousClose | number:'1.2-2'}}</p>
              <p><strong>52W High:</strong> {{index.yearHigh | number:'1.2-2'}}</p>
              <p><strong>52W Low:</strong> {{index.yearLow | number:'1.2-2'}}</p>
            </div>
          </div>
        </div>
      </p-card>
    </div>
  `
})
export class IndicesWebSocketDemoComponent implements OnInit, OnDestroy {
  connectionState: WebSocketConnectionState = WebSocketConnectionState.DISCONNECTED;
  lastError: string | null = null;
  indexNameInput = '';
  
  allIndicesData: IndicesDto | null = null;
  specificIndexData: IndicesDto | null = null;
  activeSubscriptions: WebSocketSubscription[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(private indicesWebSocketService: IndicesWebSocketService) {}

  ngOnInit(): void {
    // Subscribe to connection state changes
    this.subscriptions.push(
      this.indicesWebSocketService.connectionState.subscribe(state => {
        this.connectionState = state;
      })
    );

    // Subscribe to errors
    this.subscriptions.push(
      this.indicesWebSocketService.errors.subscribe(error => {
        this.lastError = error;
      })
    );

    this.updateActiveSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.disconnect();
  }

  get isConnected(): boolean {
    return this.indicesWebSocketService.isConnected;
  }

  get isSubscribedToAll(): boolean {
    return this.indicesWebSocketService.isSubscribedToAllIndices();
  }

  async connect(): Promise<void> {
    try {
      await this.indicesWebSocketService.connect();
      this.lastError = null;
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.indicesWebSocketService.disconnect();
      this.allIndicesData = null;
      this.specificIndexData = null;
      this.updateActiveSubscriptions();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  }

  subscribeToAll(): void {
    if (!this.isConnected) return;

    this.subscriptions.push(
      this.indicesWebSocketService.subscribeToAllIndices().subscribe(data => {
        this.allIndicesData = data;
        this.updateActiveSubscriptions();
      })
    );
  }

  subscribeToIndex(): void {
    if (!this.isConnected || !this.indexNameInput.trim()) return;

    const indexName = this.indexNameInput.trim();
    
    this.subscriptions.push(
      this.indicesWebSocketService.subscribeToIndex(indexName).subscribe(data => {
        this.specificIndexData = data;
        this.updateActiveSubscriptions();
      })
    );

    this.indexNameInput = '';
  }

  unsubscribeFromAll(): void {
    this.indicesWebSocketService.unsubscribeFromAllIndices();
    this.allIndicesData = null;
    this.updateActiveSubscriptions();
  }

  unsubscribeSpecific(subscription: WebSocketSubscription): void {
    if (subscription.config.indexName) {
      this.indicesWebSocketService.unsubscribeFromIndex(subscription.config.indexName);
      this.specificIndexData = null;
    } else {
      this.unsubscribeFromAll();
    }
    this.updateActiveSubscriptions();
  }

  private updateActiveSubscriptions(): void {
    this.activeSubscriptions = this.indicesWebSocketService.getActiveSubscriptions();
  }
}