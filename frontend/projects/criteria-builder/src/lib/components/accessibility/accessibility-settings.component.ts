import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AccessibilityService } from '../../services/accessibility.service';

/**
 * Component for managing accessibility settings
 */
@Component({
  selector: 'ac-accessibility-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="accessibility-settings" role="region" aria-labelledby="accessibility-heading">
      <h3 id="accessibility-heading">Accessibility Settings</h3>
      
      <div class="settings-group">
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox"
              [(ngModel)]="highContrastMode"
              (change)="onHighContrastChange()"
              [attr.aria-describedby]="'high-contrast-desc'">
            <span class="setting-text">High Contrast Mode</span>
          </label>
          <div id="high-contrast-desc" class="setting-description">
            Increases contrast and uses bold text for better visibility
          </div>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox"
              [(ngModel)]="colorBlindMode"
              (change)="onColorBlindModeChange()"
              [attr.aria-describedby]="'colorblind-desc'">
            <span class="setting-text">Colorblind-Friendly Mode</span>
          </label>
          <div id="colorblind-desc" class="setting-description">
            Adds patterns and shapes to distinguish token types without relying on color
          </div>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox"
              [(ngModel)]="screenReaderMode"
              (change)="onScreenReaderModeChange()"
              [attr.aria-describedby]="'screen-reader-desc'">
            <span class="setting-text">Enhanced Screen Reader Support</span>
          </label>
          <div id="screen-reader-desc" class="setting-description">
            Provides detailed descriptions and announcements for screen reader users
          </div>
        </div>
      </div>
      
      <div class="keyboard-shortcuts" role="region" aria-labelledby="shortcuts-heading">
        <h4 id="shortcuts-heading">Keyboard Shortcuts</h4>
        <dl class="shortcuts-list">
          <dt>Ctrl + Enter</dt>
          <dd>Add new condition</dd>
          
          <dt>Ctrl + Shift + Enter</dt>
          <dd>Add new group</dd>
          
          <dt>Delete / Backspace</dt>
          <dd>Delete selected token</dd>
          
          <dt>F2 / Enter / Space</dt>
          <dd>Edit selected token</dd>
          
          <dt>Arrow Down</dt>
          <dd>Open dropdown options</dd>
          
          <dt>Ctrl + D</dt>
          <dd>Duplicate selected token</dd>
          
          <dt>Ctrl + Arrow Up/Down</dt>
          <dd>Move token up/down</dd>
          
          <dt>Ctrl + G</dt>
          <dd>Toggle grouping</dd>
          
          <dt>Arrow Left/Right</dt>
          <dd>Navigate between tokens</dd>
          
          <dt>Home / End</dt>
          <dd>Go to first/last token</dd>
          
          <dt>Escape</dt>
          <dd>Cancel current action</dd>
        </dl>
      </div>
      
      <div class="token-legend" role="region" aria-labelledby="legend-heading">
        <h4 id="legend-heading">Token Types</h4>
        <div class="legend-items">
          <div class="legend-item" *ngFor="let tokenType of tokenTypes">
            <span 
              class="legend-token"
              [class]="'token-' + tokenType.type"
              [style.background-image]="getTokenPattern(tokenType.type)"
              [attr.aria-label]="tokenType.label">
              <span class="token-shape" *ngIf="colorBlindMode">{{ getTokenShape(tokenType.type) }}</span>
              {{ tokenType.example }}
            </span>
            <span class="legend-description">{{ tokenType.description }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accessibility-settings {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f9f9f9;
    }
    
    .settings-group {
      margin-bottom: 1.5rem;
    }
    
    .setting-item {
      margin-bottom: 1rem;
    }
    
    .setting-label {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }
    
    .setting-label input[type="checkbox"] {
      margin-top: 0.125rem;
    }
    
    .setting-description {
      margin-top: 0.25rem;
      margin-left: 1.5rem;
      font-size: 0.875rem;
      color: #666;
    }
    
    .keyboard-shortcuts,
    .token-legend {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
    }
    
    .shortcuts-list {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.5rem 1rem;
      margin: 0;
    }
    
    .shortcuts-list dt {
      font-family: monospace;
      font-weight: bold;
      background: #f0f0f0;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      white-space: nowrap;
    }
    
    .shortcuts-list dd {
      margin: 0;
      padding: 0.25rem 0;
    }
    
    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .legend-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      min-width: 100px;
    }
    
    .legend-token {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border: 1px solid;
      border-radius: 3px;
      font-size: 0.875rem;
      position: relative;
    }
    
    .token-shape {
      position: absolute;
      top: -2px;
      right: -2px;
      font-size: 0.75rem;
      background: white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ccc;
    }
    
    .legend-description {
      font-size: 0.75rem;
      text-align: center;
      color: #666;
    }
    
    /* Token type styles */
    .token-field {
      background-color: #e3f2fd;
      border-color: #2196f3;
      color: #1976d2;
    }
    
    .token-operator {
      background-color: #f5f5f5;
      border-color: #9e9e9e;
      color: #424242;
    }
    
    .token-value {
      background-color: #e8f5e8;
      border-color: #4caf50;
      color: #2e7d32;
    }
    
    .token-function {
      background-color: #f3e5f5;
      border-color: #9c27b0;
      color: #7b1fa2;
    }
    
    .token-group {
      background-color: #fff3e0;
      border-color: #ff9800;
      color: #f57c00;
    }
    
    .token-logic {
      background-color: #fce4ec;
      border-color: #e91e63;
      color: #c2185b;
    }
    
    /* High contrast mode */
    :host-context(.high-contrast) .token-field {
      background-color: #000080;
      color: #ffffff;
      border-color: #ffffff;
      font-weight: bold;
    }
    
    :host-context(.high-contrast) .token-operator {
      background-color: #000000;
      color: #ffffff;
      border-color: #ffffff;
      font-weight: bold;
    }
    
    :host-context(.high-contrast) .token-value {
      background-color: #008000;
      color: #ffffff;
      border-color: #ffffff;
      font-weight: bold;
    }
    
    :host-context(.high-contrast) .token-function {
      background-color: #800080;
      color: #ffffff;
      border-color: #ffffff;
      font-weight: bold;
    }
    
    :host-context(.high-contrast) .token-group {
      background-color: #ff8000;
      color: #000000;
      border-color: #000000;
      font-weight: bold;
    }
    
    :host-context(.high-contrast) .token-logic {
      background-color: #ff0000;
      color: #ffffff;
      border-color: #ffffff;
      font-weight: bold;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessibilitySettingsComponent implements OnInit, OnDestroy {
  
  highContrastMode = false;
  colorBlindMode = false;
  screenReaderMode = false;
  
  tokenTypes = [
    { type: 'field', label: 'Field token', example: 'Price', description: 'Data fields' },
    { type: 'operator', label: 'Operator token', example: '>', description: 'Comparison operators' },
    { type: 'value', label: 'Value token', example: '100', description: 'Values and constants' },
    { type: 'function', label: 'Function token', example: 'SMA()', description: 'Functions and calculations' },
    { type: 'group', label: 'Group token', example: '( )', description: 'Grouping parentheses' },
    { type: 'logic', label: 'Logic token', example: 'AND', description: 'Logical operators' }
  ];
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private accessibilityService: AccessibilityService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    // Subscribe to accessibility mode changes
    this.accessibilityService.highContrastMode
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        this.highContrastMode = enabled;
        this.cdr.markForCheck();
      });
    
    this.accessibilityService.colorBlindMode
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        this.colorBlindMode = enabled;
        this.cdr.markForCheck();
      });
    
    this.accessibilityService.screenReaderMode
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        this.screenReaderMode = enabled;
        this.cdr.markForCheck();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onHighContrastChange(): void {
    this.accessibilityService.setHighContrastMode(this.highContrastMode);
  }
  
  onColorBlindModeChange(): void {
    this.accessibilityService.setColorBlindMode(this.colorBlindMode);
  }
  
  onScreenReaderModeChange(): void {
    this.accessibilityService.setScreenReaderMode(this.screenReaderMode);
  }
  
  getTokenPattern(type: string): string {
    return this.accessibilityService.getTokenPatternForColorBlind(type as any);
  }
  
  getTokenShape(type: string): string {
    return this.accessibilityService.getTokenShapeIndicator(type as any);
  }
}