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

  ngOnChanges(): void {
    if (this.selectedPortfolio) {
      // Create a deep copy for editing
      this.editingPortfolio = { ...this.selectedPortfolio };
    } else {
      this.editingPortfolio = null;
    }
  }

  onSaveChanges(): void {
    if (this.editingPortfolio) {
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

  onRiskProfileChange(value: string): void {
    if (this.editingPortfolio) {
      this.editingPortfolio.riskProfile = value;
    }
  }

  onDescriptionChange(value: string): void {
    if (this.editingPortfolio) {
      this.editingPortfolio.description = value;
    }
  }
}
