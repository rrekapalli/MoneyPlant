import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { PortfolioWithMetrics } from '../portfolio.types';

@Component({
  selector: 'app-portfolio-configure',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    FormsModule
  ],
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class PortfolioConfigureComponent {
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;
  @Input() riskProfileOptions: any[] = [];

  @Output() saveChanges = new EventEmitter<PortfolioWithMetrics>();
  @Output() cancel = new EventEmitter<void>();

  // Local copy for editing
  editingPortfolio: PortfolioWithMetrics | null = null;
  
  // Flag to distinguish between creation and editing modes
  isCreationMode = false;

  ngOnChanges(): void {
    if (this.selectedPortfolio) {
      // Check if this is a new portfolio (creation mode)
      this.isCreationMode = this.selectedPortfolio.id === 0;
      // Create a deep copy for editing
      this.editingPortfolio = { ...this.selectedPortfolio };
    } else {
      this.editingPortfolio = null;
      this.isCreationMode = false;
    }
  }

  onSaveChanges(): void {
    if (this.editingPortfolio) {
      // Validate required fields
      if (!this.editingPortfolio.name || this.editingPortfolio.name.trim() === '') {
        alert('Portfolio name is required');
        return;
      }
      
      if (!this.editingPortfolio.riskProfile) {
        alert('Risk profile is required');
        return;
      }
      
      // Emit the portfolio data
      this.saveChanges.emit(this.editingPortfolio);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onPortfolioNameChange(value: string): void {
    if (this.editingPortfolio) {
      this.editingPortfolio.name = value;
    }
  }

  onRiskProfileChange(event: any): void {
    if (this.editingPortfolio) {
      // Handle both direct value and event object from PrimeNG select
      const value = event?.value !== undefined ? event.value : event;
      this.editingPortfolio.riskProfile = value;
    }
  }

  onDescriptionChange(value: string): void {
    if (this.editingPortfolio) {
      this.editingPortfolio.description = value;
    }
  }
}
