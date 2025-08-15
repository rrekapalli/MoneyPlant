import {Component, Input, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {IStockTileOptions} from './stock-tile-options';

@Component({
  selector: 'vis-stock-tile',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stock-tile-container" 
         [style.background-color]="stockTileOptions.backgroundColor || stockTileOptions.color"
         [style.opacity]="stockTileOptions.backgroundOpacity || 1">
      <div class="stock-tile-content">
        <!-- Symbol at top -->
        <div class="stock-tile-symbol" [style.color]="stockTileOptions.color">
          {{ stockTileOptions.description }}
        </div>
        
        <!-- Main price and change section -->
        <div class="stock-tile-main-section">
          <div class="stock-tile-price-line">
            <div class="stock-tile-price" [style.color]="stockTileOptions.color">
              {{ stockTileOptions.value }}
            </div>
            <div class="stock-tile-change" [class]="'change-' + stockTileOptions.changeType" [style.color]="stockTileOptions.color">
              {{ stockTileOptions.change }}
            </div>
          </div>
        </div>
        
        <!-- High/Low section at bottom -->
        <div class="stock-tile-high-low-section">
          <div class="stock-tile-high">
            <span class="stock-tile-high-label">High:</span>
            <span class="stock-tile-high-value" [style.color]="stockTileOptions.color">
              {{ stockTileOptions.highValue || '0' }}
            </span>
          </div>
          <div class="stock-tile-low">
            <span class="stock-tile-low-label">Low:</span>
            <span class="stock-tile-low-value" [style.color]="stockTileOptions.color">
              {{ stockTileOptions.lowValue || '0' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stock-tile-container {
      padding-top: 0.25rem !important;
      padding: 1.0rem;
      border-radius: 0.5rem;
      color: white;
      height: 100%;
      display: flex;
      align-items: center;
      min-height: 120px;
    }
    
    .stock-tile-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: space-between;
      min-height: 100%;
    }
    
    .stock-tile-symbol {
      font-size: 0.875rem;
      font-weight: 600;
      opacity: 0.9;
      text-align: center;
      padding-top: 0.5rem;
    }
    
    .stock-tile-main-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      flex: 1;
      justify-content: center;
    }
    
    .stock-tile-price-line {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    
    .stock-tile-price {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }
    
    .stock-tile-change {
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1;
    }
    
    .stock-tile-high-low-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-top: 0.5rem;
    }
    
    .stock-tile-high,
    .stock-tile-low {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .stock-tile-high-label,
    .stock-tile-low-label {
      font-size: 0.625rem;
      opacity: 0.8;
      font-weight: 500;
    }
    
    .stock-tile-high-value,
    .stock-tile-low-value {
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .change-positive {
      color: #10b981 !important;
    }
    
    .change-negative {
      color: #ef4444 !important;
    }
    
    .change-neutral {
      color: #6b7280 !important;
    }
  `]
})
export class StockTileComponent implements OnChanges {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<any>;
  @Input() onUpdateFilter!: EventEmitter<any>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widget'] && this.widget) {
      console.log('StockTileComponent: Widget changed, triggering update');
      console.log('New widget options:', this.widget.config?.options);
      
      // Force change detection when widget data changes
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  get stockTileOptions(): IStockTileOptions {
    return this.widget?.config?.options as IStockTileOptions;
  }
} 