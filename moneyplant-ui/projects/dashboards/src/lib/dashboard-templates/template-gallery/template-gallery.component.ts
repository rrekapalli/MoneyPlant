import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardTemplateService } from '../../services/dashboard-template.service';
import { IDashboardTemplate } from '../../entities/IDashboardTemplate';

@Component({
  selector: 'vis-template-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="template-gallery">
      <div class="template-gallery-header">
        <h2>Dashboard Templates</h2>
        <div class="template-filters">
          <input 
            type="text" 
            placeholder="Search templates..." 
            [(ngModel)]="searchTerm"
            (input)="filterTemplates()"
          />
          <select [(ngModel)]="selectedCategory" (change)="filterTemplates()">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
          <div class="template-type-filter">
            <label>
              <input type="checkbox" [(ngModel)]="showPreBuilt" (change)="filterTemplates()">
              Pre-built
            </label>
            <label>
              <input type="checkbox" [(ngModel)]="showUserCreated" (change)="filterTemplates()">
              My Templates
            </label>
          </div>
        </div>
      </div>
      
      <div class="template-grid">
        <div 
          *ngFor="let template of filteredTemplates" 
          class="template-card"
          [class.selected]="selectedTemplate?.id === template.id"
          (click)="selectTemplate(template)"
        >
          <div class="template-thumbnail">
            <img [src]="template.thumbnailUrl || 'assets/templates/default.png'" alt="{{ template.name }}">
          </div>
          <div class="template-info">
            <h3>{{ template.name }}</h3>
            <p>{{ template.description }}</p>
            <div class="template-meta">
              <span class="template-type" [class.pre-built]="template.isPreBuilt">
                {{ template.isPreBuilt ? 'Pre-built' : 'Custom' }}
              </span>
              <span *ngIf="template.category && template.category.length > 0" class="template-categories">
                {{ template.category.join(', ') }}
              </span>
            </div>
          </div>
        </div>
        
        <div *ngIf="filteredTemplates.length === 0" class="no-templates">
          <p>No templates found matching your criteria.</p>
        </div>
      </div>
      
      <div class="template-actions">
        <button 
          (click)="cancelSelection()" 
          class="btn-cancel"
        >
          Cancel
        </button>
        <button 
          (click)="applyTemplate()" 
          class="btn-apply" 
          [disabled]="!selectedTemplate"
        >
          Apply Template
        </button>
      </div>
    </div>
  `,
  styles: [`
    .template-gallery {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem;
    }
    
    .template-gallery-header {
      margin-bottom: 1rem;
    }
    
    .template-filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    
    .template-filters input,
    .template-filters select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .template-type-filter {
      display: flex;
      gap: 1rem;
    }
    
    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      overflow-y: auto;
      flex-grow: 1;
    }
    
    .template-card {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .template-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .template-card.selected {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }
    
    .template-thumbnail {
      height: 160px;
      overflow: hidden;
    }
    
    .template-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .template-info {
      padding: 1rem;
    }
    
    .template-info h3 {
      margin: 0 0 0.5rem 0;
    }
    
    .template-info p {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .template-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #888;
    }
    
    .template-type {
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background-color: #eee;
    }
    
    .template-type.pre-built {
      background-color: #e3f2fd;
      color: #0d47a1;
    }
    
    .no-templates {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;
      color: #666;
    }
    
    .template-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-cancel {
      background-color: #f8f9fa;
      border: 1px solid #ddd;
    }
    
    .btn-apply {
      background-color: #007bff;
      color: white;
    }
    
    .btn-apply:disabled {
      background-color: #b3d7ff;
      cursor: not-allowed;
    }
  `]
})
export class TemplateGalleryComponent implements OnInit {
  @Output() templateSelected = new EventEmitter<IDashboardTemplate>();
  @Output() cancel = new EventEmitter<void>();
  
  templates: IDashboardTemplate[] = [];
  filteredTemplates: IDashboardTemplate[] = [];
  selectedTemplate: IDashboardTemplate | null = null;
  
  searchTerm: string = '';
  selectedCategory: string = '';
  showPreBuilt: boolean = true;
  showUserCreated: boolean = true;
  
  categories: string[] = [];
  
  constructor(private templateService: DashboardTemplateService) {}
  
  ngOnInit(): void {
    this.loadTemplates();
  }
  
  loadTemplates(): void {
    this.templateService.getAllTemplates().subscribe(templates => {
      this.templates = templates;
      this.filteredTemplates = templates;
      this.extractCategories();
    });
  }
  
  extractCategories(): void {
    const categorySet = new Set<string>();
    this.templates.forEach(template => {
      if (template.category && template.category.length > 0) {
        template.category.forEach(cat => categorySet.add(cat));
      }
    });
    this.categories = Array.from(categorySet).sort();
  }
  
  filterTemplates(): void {
    this.filteredTemplates = this.templates.filter(template => {
      // Filter by search term
      const matchesSearch = !this.searchTerm || 
        template.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      // Filter by category
      const matchesCategory = !this.selectedCategory || 
        (template.category && template.category.includes(this.selectedCategory));
      
      // Filter by type
      const matchesType = (template.isPreBuilt && this.showPreBuilt) || 
        (!template.isPreBuilt && this.showUserCreated);
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }
  
  selectTemplate(template: IDashboardTemplate): void {
    this.selectedTemplate = template;
  }
  
  applyTemplate(): void {
    if (this.selectedTemplate) {
      this.templateSelected.emit(this.selectedTemplate);
    }
  }
  
  cancelSelection(): void {
    this.cancel.emit();
  }
}