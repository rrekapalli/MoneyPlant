import {Component, Input, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IWidget} from '../../entities/IWidget';
import {ITileOptions} from '../../entities/ITileOptions';

@Component({
  selector: 'vis-tile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tile-container" [style.background-color]="tileOptions.color">
      <div class="tile-content">
        <div class="tile-icon">
          <i [class]="tileOptions.icon"></i>
        </div>
        <div class="tile-info">
          <div class="tile-value">{{ tileOptions.value }}</div>
          <div class="tile-change" [class]="'change-' + tileOptions.changeType">
            {{ tileOptions.change }}
          </div>
          <div class="tile-description">{{ tileOptions.description }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tile-container {
      padding: 1.5rem;
      border-radius: 0.5rem;
      color: white;
      height: 100%;
      display: flex;
      align-items: center;
    }
    .tile-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }
    .tile-icon {
      font-size: 2rem;
      opacity: 0.8;
    }
    .tile-info {
      flex: 1;
    }
    .tile-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .tile-change {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    .tile-description {
      font-size: 0.75rem;
      opacity: 0.8;
    }
    .change-positive {
      color: #10b981;
    }
    .change-negative {
      color: #ef4444;
    }
    .change-neutral {
      color: #6b7280;
    }
  `]
})
export class TileComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<any>;
  @Input() onUpdateFilter!: EventEmitter<any>;

  get tileOptions(): ITileOptions {
    return this.widget?.config?.options as ITileOptions;
  }
}
