import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from '../../entities/IWidget';

/**
 * A placeholder component shown while the actual widget component is being loaded
 */
@Component({
  selector: 'vis-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-container" [attr.aria-label]="'Loading ' + (widget?.config?.header?.title || 'widget')">
      <div class="placeholder-content">
        <div class="placeholder-spinner"></div>
        <div class="placeholder-text">Loading widget...</div>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 8px;
      padding: 20px;
    }

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .placeholder-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #3498db;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .placeholder-text {
      color: #666;
      font-size: 14px;
      animation: fadeInOut 1.5s ease-in-out infinite;
    }

    @keyframes fadeInOut {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class PlaceholderComponent {
  @Input() widget?: IWidget;
}