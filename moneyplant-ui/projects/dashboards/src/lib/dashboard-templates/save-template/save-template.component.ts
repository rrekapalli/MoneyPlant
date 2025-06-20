import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardTemplateService } from '../../services/dashboard-template.service';
import { IDashboardTemplate } from '../../entities/IDashboardTemplate';

@Component({
  selector: 'vis-save-template',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="save-template-container">
      <h2>Save Dashboard as Template</h2>

      <div class="form-group">
        <label for="templateName">Template Name *</label>
        <input 
          type="text" 
          id="templateName" 
          [(ngModel)]="templateName" 
          placeholder="Enter a name for your template"
          required
        >
      </div>

      <div class="form-group">
        <label for="templateDescription">Description</label>
        <textarea 
          id="templateDescription" 
          [(ngModel)]="templateDescription" 
          placeholder="Enter a description for your template"
          rows="3"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="templateCategories">Categories</label>
        <div class="categories-input">
          <input 
            type="text" 
            id="templateCategories" 
            [(ngModel)]="categoryInput" 
            placeholder="Add categories (comma separated)"
          >
          <button 
            type="button" 
            class="btn-add-category" 
            (click)="addCategory()"
            [disabled]="!categoryInput.trim()"
          >
            Add
          </button>
        </div>
        <div class="categories-list" *ngIf="categories.length > 0">
          <span 
            *ngFor="let category of categories" 
            class="category-tag"
          >
            {{ category }}
            <button 
              type="button" 
              class="btn-remove-category" 
              (click)="removeCategory(category)"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <div class="form-group">
        <label for="templateThumbnail">Thumbnail URL</label>
        <input 
          type="text" 
          id="templateThumbnail" 
          [(ngModel)]="thumbnailUrl" 
          placeholder="Enter a URL for the template thumbnail"
        >
        <div class="thumbnail-preview" *ngIf="thumbnailUrl">
          <img [src]="thumbnailUrl" alt="Template thumbnail preview" (error)="handleImageError($event)">
        </div>
      </div>

      <div class="template-actions">
        <button 
          type="button" 
          class="btn-cancel" 
          (click)="cancelForm()"
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="btn-save" 
          [disabled]="!templateName.trim()"
          (click)="saveTemplate()"
        >
          Save Template
        </button>
      </div>
    </div>
  `,
  styles: [`
    .save-template-container {
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    h2 {
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input, textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }

    .categories-input {
      display: flex;
      gap: 0.5rem;
    }

    .btn-add-category {
      padding: 0.5rem 1rem;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-add-category:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .categories-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .category-tag {
      display: inline-flex;
      align-items: center;
      background-color: #e3f2fd;
      color: #0d47a1;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .btn-remove-category {
      background: none;
      border: none;
      color: #0d47a1;
      font-size: 1.25rem;
      line-height: 1;
      padding: 0 0 0 0.25rem;
      cursor: pointer;
    }

    .thumbnail-preview {
      margin-top: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      max-width: 300px;
    }

    .thumbnail-preview img {
      width: 100%;
      height: auto;
      display: block;
    }

    .template-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-cancel {
      background-color: #f8f9fa;
      border: 1px solid #ddd;
    }

    .btn-save {
      background-color: #007bff;
      color: white;
    }

    .btn-save:disabled {
      background-color: #b3d7ff;
      cursor: not-allowed;
    }
  `]
})
export class SaveTemplateComponent implements OnInit {
  @Input() dashboardConfig: any;
  @Output() saved = new EventEmitter<IDashboardTemplate>();
  @Output() cancel = new EventEmitter<void>();

  templateName: string = '';
  templateDescription: string = '';
  categories: string[] = [];
  categoryInput: string = '';
  thumbnailUrl: string = '';

  constructor(private templateService: DashboardTemplateService) {}

  ngOnInit(): void {
    // Generate a default name based on current date
    this.templateName = `Dashboard Template - ${new Date().toLocaleDateString()}`;
  }

  addCategory(): void {
    if (this.categoryInput.trim()) {
      // Split by commas and add each category
      const newCategories = this.categoryInput
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat && !this.categories.includes(cat));

      this.categories = [...this.categories, ...newCategories];
      this.categoryInput = '';
    }
  }

  removeCategory(category: string): void {
    this.categories = this.categories.filter(cat => cat !== category);
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/templates/default.png';
  }

  cancelForm(): void {
    this.cancel.emit();
  }

  saveTemplate(): void {
    if (!this.templateName.trim()) {
      return;
    }

    const template: IDashboardTemplate = {
      id: '', // Will be generated by the service
      name: this.templateName.trim(),
      description: this.templateDescription.trim() || undefined,
      category: this.categories.length > 0 ? this.categories : undefined,
      thumbnailUrl: this.thumbnailUrl.trim() || undefined,
      isPreBuilt: false,
      dashboardConfig: this.dashboardConfig
    };

    this.templateService.saveTemplate(template).subscribe(
      savedTemplate => {
        this.saved.emit(savedTemplate);
      },
      error => {
        console.error('Error saving template:', error);
        // Could add error handling UI here
      }
    );
  }
}
