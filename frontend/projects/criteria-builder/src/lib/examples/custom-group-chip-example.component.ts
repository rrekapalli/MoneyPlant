import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomGroupChipComponent } from '../components/group-chip/custom-group-chip.component';
import { OverlayPanel } from 'primeng/overlaypanel';

/**
 * Example component demonstrating the Custom Group Chip usage
 */
@Component({
    selector: 'mp-custom-group-chip-example',
    standalone: true,
    imports: [CommonModule, CustomGroupChipComponent],
    template: `
    <div class="example-container">
      <h2>Custom Group Chip Examples</h2>
      
      <div class="example-section">
        <h3>Basic Group Chip</h3>
        <mp-custom-group-chip
          chipId="basic-chip"
          displayText="Basic Group"
          [hasToggle]="false"
          [deletable]="true"
          [showPopover]="true"
          tooltip="Click to configure"
          (chipClick)="onChipClick($event)"
          (deleteClick)="onDeleteClick($event)">
        </mp-custom-group-chip>
      </div>
      
      <div class="example-section">
        <h3>Group Chip with Toggle</h3>
        <mp-custom-group-chip
          chipId="toggle-chip"
          displayText="Toggleable Group"
          [hasToggle]="true"
          [toggleState]="false"
          [deletable]="true"
          [showPopover]="true"
          severity="primary"
          tooltip="Group with toggle functionality"
          (chipClick)="onChipClick($event)"
          (toggleClick)="onToggleClick($event)"
          (deleteClick)="onDeleteClick($event)"
          (fieldSelected)="onFieldSelected($event)"
          (operatorSelected)="onOperatorSelected($event)"
          (functionSelected)="onFunctionSelected($event)"
          (indicatorSelected)="onIndicatorSelected($event)">
        </mp-custom-group-chip>
      </div>
      
      <div class="example-section">
        <h3>Enabled Toggle Group Chip</h3>
        <mp-custom-group-chip
          chipId="enabled-toggle-chip"
          displayText="Enabled Group"
          [hasToggle]="true"
          [toggleState]="true"
          [deletable]="true"
          [showPopover]="true"
          severity="success"
          tooltip="Group with enabled toggle"
          (chipClick)="onChipClick($event)"
          (toggleClick)="onToggleClick($event)"
          (deleteClick)="onDeleteClick($event)">
        </mp-custom-group-chip>
      </div>
      
      <div class="example-section">
        <h3>Different Severities</h3>
        <div class="chips-row">
          <mp-custom-group-chip
            chipId="secondary-chip"
            displayText="Secondary"
            severity="secondary"
            [hasToggle]="true"
            [deletable]="true"
            (chipClick)="onChipClick($event)"
            (toggleClick)="onToggleClick($event)"
            (deleteClick)="onDeleteClick($event)">
          </mp-custom-group-chip>
          
          <mp-custom-group-chip
            chipId="info-chip"
            displayText="Info"
            severity="info"
            [hasToggle]="true"
            [deletable]="true"
            (chipClick)="onChipClick($event)"
            (toggleClick)="onToggleClick($event)"
            (deleteClick)="onDeleteClick($event)">
          </mp-custom-group-chip>
          
          <mp-custom-group-chip
            chipId="warn-chip"
            displayText="Warning"
            severity="warn"
            [hasToggle]="true"
            [deletable]="true"
            (chipClick)="onChipClick($event)"
            (toggleClick)="onToggleClick($event)"
            (deleteClick)="onDeleteClick($event)">
          </mp-custom-group-chip>
          
          <mp-custom-group-chip
            chipId="danger-chip"
            displayText="Danger"
            severity="danger"
            [hasToggle]="true"
            [deletable]="true"
            (chipClick)="onChipClick($event)"
            (toggleClick)="onToggleClick($event)"
            (deleteClick)="onDeleteClick($event)">
          </mp-custom-group-chip>
        </div>
      </div>
      
      <div class="example-section">
        <h3>Disabled State</h3>
        <mp-custom-group-chip
          chipId="disabled-chip"
          displayText="Disabled Group"
          [disabled]="true"
          [hasToggle]="true"
          [deletable]="true"
          [showPopover]="true"
          tooltip="This chip is disabled"
          (chipClick)="onChipClick($event)"
          (toggleClick)="onToggleClick($event)"
          (deleteClick)="onDeleteClick($event)">
        </mp-custom-group-chip>
      </div>
      
      <div class="example-section">
        <h3>Different Sizes</h3>
        <div class="chips-row">
          <mp-custom-group-chip
            chipId="small-chip"
            displayText="Small"
            size="small"
            [hasToggle]="true"
            [deletable]="true"
            (chipClick)="onChipClick($event)"
            (toggleClick)="onToggleClick($event)"
            (deleteClick)="onDeleteClick($event)">
          </mp-custom-group-chip>
          
          <mp-custom-group-chip
            chipId="normal-chip"
            displayText="Normal"
            [hasToggle]="true"
            [deletable]="true"
            (chipClick)="onChipClick($event)"
            (toggleClick)="onToggleClick($event)"
            (deleteClick)="onDeleteClick($event)">
          </mp-custom-group-chip>
          
          <mp-custom-group-chip
            chipId="large-chip"
            displayText="Large"
            size="large"
            [hasToggle]="true"
            [deletable]="true"
            (chipClick)="onChipClick($event)"
            (toggleClick)="onToggleClick($event)"
            (deleteClick)="onDeleteClick($event)">
          </mp-custom-group-chip>
        </div>
      </div>
      
      <!-- Event Log -->
      <div class="event-log">
        <h3>Event Log</h3>
        <div class="log-content">
          <div *ngFor="let event of eventLog; trackBy: trackByIndex" class="log-entry">
            <span class="timestamp">{{ event.timestamp | date:'HH:mm:ss.SSS' }}</span>
            <span class="event-type">{{ event.type }}</span>
            <span class="event-data">{{ event.data | json }}</span>
          </div>
        </div>
        <button class="clear-log-btn" (click)="clearLog()">Clear Log</button>
      </div>
    </div>
  `,
    styles: [`
    .example-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .example-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      background: var(--surface-0);
    }
    
    .example-section h3 {
      margin: 0 0 1rem 0;
      color: var(--text-color);
      font-size: 1.125rem;
      font-weight: 600;
    }
    
    .chips-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .event-log {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      background: var(--surface-50);
    }
    
    .event-log h3 {
      margin: 0 0 1rem 0;
      color: var(--text-color);
      font-size: 1.125rem;
      font-weight: 600;
    }
    
    .log-content {
      max-height: 300px;
      overflow-y: auto;
      background: var(--surface-0);
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      padding: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .log-entry {
      display: flex;
      gap: 1rem;
      padding: 0.25rem 0;
      border-bottom: 1px solid var(--surface-100);
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
    
    .log-entry:last-child {
      border-bottom: none;
    }
    
    .timestamp {
      color: var(--text-color-secondary);
      min-width: 80px;
    }
    
    .event-type {
      color: var(--primary-color);
      font-weight: 600;
      min-width: 120px;
    }
    
    .event-data {
      color: var(--text-color);
      flex: 1;
    }
    
    .clear-log-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      background: var(--surface-0);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    
    .clear-log-btn:hover {
      background: var(--primary-50);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    @media (max-width: 767px) {
      .example-container {
        padding: 1rem;
      }
      
      .chips-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .log-entry {
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .timestamp,
      .event-type {
        min-width: auto;
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomGroupChipExampleComponent {
    eventLog: Array<{ timestamp: Date, type: string, data: any }> = [];

    onChipClick(chipId: string): void {
        this.logEvent('chipClick', { chipId });
    }

    onToggleClick(event: { chipId: string, enabled: boolean }): void {
        this.logEvent('toggleClick', event);
    }

    onDeleteClick(chipId: string): void {
        this.logEvent('deleteClick', { chipId });
    }

    onFieldSelected(event: { chipId: string, field: any }): void {
        this.logEvent('fieldSelected', event);
    }

    onOperatorSelected(event: { chipId: string, operator: any }): void {
        this.logEvent('operatorSelected', event);
    }

    onFunctionSelected(event: { chipId: string, function: any }): void {
        this.logEvent('functionSelected', event);
    }

    onIndicatorSelected(event: { chipId: string, indicator: any }): void {
        this.logEvent('indicatorSelected', event);
    }

    private logEvent(type: string, data: any): void {
        this.eventLog.unshift({
            timestamp: new Date(),
            type,
            data
        });

        // Keep only last 50 events
        if (this.eventLog.length > 50) {
            this.eventLog = this.eventLog.slice(0, 50);
        }
    }

    clearLog(): void {
        this.eventLog = [];
    }

    trackByIndex(index: number): number {
        return index;
    }
}