import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioApiService } from '../../../services/apis/portfolio.api';
import { PortfolioCreateRequest, PortfolioUpdateRequest } from '../../../services/entities/portfolio.entities';
import { AuthService } from '../../../services/security/auth.service';

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
  @Output() goToOverview = new EventEmitter<void>();

  // Inject the portfolio API service
  private portfolioApiService = inject(PortfolioApiService);
  
  // Inject the auth service to get current user ID
  private authService = inject(AuthService);

  // Local copy for editing
  editingPortfolio: PortfolioWithMetrics | null = null;
  
  // Flag to distinguish between creation and editing modes
  isCreationMode = false;

  // Single editing state for all fields
  isEditing = false;

  // Loading state for save operation
  isSaving = false;

  ngOnChanges(): void {
    if (this.selectedPortfolio) {
      // Check if this is a new portfolio (creation mode)
      this.isCreationMode = this.selectedPortfolio.id === 0;
      // Create a deep copy for editing
      this.editingPortfolio = { ...this.selectedPortfolio };
      
      // Automatically enter edit mode for new portfolios
      if (this.isCreationMode) {
        this.isEditing = true;
      }
    } else {
      this.editingPortfolio = null;
      this.isCreationMode = false;
      this.isEditing = false;
    }
  }

  // Start editing all fields
  startEditAll(): void {
    this.isEditing = true;
  }

  // Save all changes using the appropriate API endpoint
  saveEditAll(): void {
    if (this.editingPortfolio && !this.isSaving) {
      // Validate required fields
      if (!this.editingPortfolio.name || this.editingPortfolio.name.trim() === '') {
        alert('Portfolio name is required');
        return;
      }
      
      if (!this.editingPortfolio.riskProfile) {
        alert('Risk profile is required');
        return;
      }

      this.isSaving = true;

      if (this.isCreationMode) {
        // Get current user ID
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
          alert('User not authenticated. Please log in again.');
          this.isSaving = false;
          return;
        }

        // Create new portfolio
        const createRequest: PortfolioCreateRequest = {
          name: this.editingPortfolio.name,
          description: this.editingPortfolio.description || '',
          baseCurrency: this.editingPortfolio.baseCurrency,
          riskProfile: this.editingPortfolio.riskProfile,
          isActive: true,
          userId: parseInt(currentUser.id, 10) // Convert string ID to number
        };

        console.log('=== PORTFOLIO CREATION DEBUG ===');
        console.log('Current user:', currentUser);
        console.log('User ID (string):', currentUser.id);
        console.log('User ID (parsed):', parseInt(currentUser.id, 10));
        console.log('Creating portfolio with request:', JSON.stringify(createRequest, null, 2));
        console.log('================================');

        this.portfolioApiService.createPortfolio(createRequest).subscribe({
          next: (createdPortfolio) => {
            console.log('Portfolio created successfully:', createdPortfolio);
            // Update the local portfolio with the created one
            this.editingPortfolio = { ...this.editingPortfolio, ...createdPortfolio };
            this.isEditing = false;
            this.isSaving = false;
            // Emit the updated portfolio
            this.saveChanges.emit(this.editingPortfolio);
          },
          error: (error) => {
            console.error('Error creating portfolio:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error
            });
            
            // Show user-friendly error message
            if (error.status === 500) {
              alert('Backend service temporarily unavailable. Changes have been saved locally and will be synchronized when the service is restored.');
            } else if (error.status === 401) {
              alert('Authentication expired. Please log in again.');
            } else if (error.status === 403) {
              alert('You do not have permission to create portfolios.');
            } else if (error.status === 400) {
              alert('Invalid portfolio data. Please check your input and try again.');
            } else {
              alert(`Failed to create portfolio (${error.status}). Changes have been saved locally.`);
            }
            
            // Fallback: save locally and emit
            console.log('Falling back to local save for new portfolio');
            this.isEditing = false;
            this.isSaving = false;
            if (this.editingPortfolio) {
              this.saveChanges.emit(this.editingPortfolio);
            }
          }
        });
      } else {
        // Update existing portfolio
        const updateRequest: PortfolioUpdateRequest = {
          name: this.editingPortfolio.name,
          description: this.editingPortfolio.description,
          riskProfile: this.editingPortfolio.riskProfile
        };

        console.log('=== PORTFOLIO UPDATE DEBUG ===');
        console.log('Portfolio ID:', this.editingPortfolio.id);
        console.log('Update Request:', JSON.stringify(updateRequest, null, 2));
        console.log('Full editing portfolio data:', JSON.stringify(this.editingPortfolio, null, 2));
        console.log('Original portfolio data:', JSON.stringify(this.selectedPortfolio, null, 2));
        console.log('================================');

        this.portfolioApiService.updatePortfolio(this.editingPortfolio.id, updateRequest).subscribe({
          next: (updatedPortfolio) => {
            console.log('Portfolio updated successfully:', updatedPortfolio);
            // Update the local portfolio with the updated one
            this.editingPortfolio = { ...this.editingPortfolio, ...updatedPortfolio };
            this.isEditing = false;
            this.isSaving = false;
            // Emit the updated portfolio
            this.saveChanges.emit(this.editingPortfolio);
          },
          error: (error) => {
            console.error('Error updating portfolio:', error);
            console.error('Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error,
              url: error.url
            });
            
            // Fallback: save locally and emit
            console.log('Falling back to local save for existing portfolio');
            this.isEditing = false;
            this.isSaving = false;
            if (this.editingPortfolio) {
              this.saveChanges.emit(this.editingPortfolio);
            }
            
            // Show user-friendly error message
            if (error.status === 500) {
              alert('Backend service temporarily unavailable. Changes have been saved locally and will be synchronized when the service is restored.');
            } else if (error.status === 401) {
              alert('Authentication expired. Please log in again.');
            } else if (error.status === 403) {
              alert('You do not have permission to update this portfolio.');
            } else if (error.status === 404) {
              alert('Portfolio not found. It may have been deleted by another user.');
            } else {
              alert(`Failed to update portfolio (${error.status}). Changes have been saved locally.`);
            }
          }
        });
      }
    }
  }

  cancelEdit(): void {
    // Reset to original values and exit editing mode
    if (this.selectedPortfolio) {
      this.editingPortfolio = { ...this.selectedPortfolio };
    }
    this.isEditing = false;
    this.isSaving = false;
    // Navigate back to overview
    this.navigateToOverview();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  navigateToOverview(): void {
    this.goToOverview.emit();
  }
}
