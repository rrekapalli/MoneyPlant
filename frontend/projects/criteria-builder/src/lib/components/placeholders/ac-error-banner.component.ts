import { Component, Input } from '@angular/core';
import { ValidationResult } from '../../models';

/**
 * Placeholder for Error Banner Component
 * Will be implemented in task 12
 */
@Component({
  selector: 'ac-error-banner',
  standalone: false,
  template: `
    <div class="error-banner-placeholder" *ngIf="validationResult && !validationResult.isValid">
      <div class="error-summary">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ validationResult?.errors?.length || 0 }} validation error(s) found</span>
        <button type="button" 
                class="toggle-details" 
                (click)="showDetails = !showDetails">
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      
      <div class="error-details" *ngIf="showDetails">
        <div class="error-item" *ngFor="let error of (validationResult?.errors || [])">
          <span class="error-type">{{ error.type }}</span>
          <span class="error-message">{{ error.message }}</span>
          <span class="error-path">{{ error.path }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-banner-placeholder {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
      color: #856404;
    }
    
    .error-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .error-summary i {
      color: #f39c12;
    }
    
    .toggle-details {
      margin-left: auto;
      padding: 0.25rem 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      cursor: pointer;
      font-size: 0.8rem;
    }
    
    .error-details {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f0c674;
    }
    
    .error-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 4px;
    }
    
    .error-type {
      font-weight: bold;
      font-size: 0.9rem;
      text-transform: uppercase;
    }
    
    .error-message {
      font-size: 0.9rem;
    }
    
    .error-path {
      font-size: 0.8rem;
      color: #666;
      font-family: monospace;
    }
  `]
})
export class AcErrorBannerComponent {
  @Input() validationResult: ValidationResult | null = null;
  @Input() showDetails: boolean = false;
}