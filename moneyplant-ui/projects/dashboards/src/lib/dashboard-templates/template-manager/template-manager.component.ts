import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateGalleryComponent } from '../template-gallery/template-gallery.component';
import { SaveTemplateComponent } from '../save-template/save-template.component';
import { IDashboardTemplate } from '../../entities/IDashboardTemplate';

@Component({
  selector: 'vis-template-manager',
  standalone: true,
  imports: [CommonModule, TemplateGalleryComponent, SaveTemplateComponent],
  template: `
    <div class="template-manager">
      <div class="template-buttons" *ngIf="!showGallery && !showSaveForm">
        <button 
          class="btn-template" 
          (click)="openGallery()"
          title="Load a dashboard template"
        >
          <i class="pi pi-folder-open"></i> Load Template
        </button>
        <button 
          class="btn-template" 
          (click)="openSaveForm()"
          title="Save current dashboard as a template"
        >
          <i class="pi pi-save"></i> Save as Template
        </button>
      </div>
      
      <div class="template-modal" *ngIf="showGallery || showSaveForm">
        <div class="template-modal-content">
          <vis-template-gallery 
            *ngIf="showGallery"
            (templateSelected)="onTemplateSelected($event)"
            (cancel)="closeAll()"
          ></vis-template-gallery>
          
          <vis-save-template
            *ngIf="showSaveForm"
            [dashboardConfig]="dashboardConfig"
            (saved)="onTemplateSaved($event)"
            (cancel)="closeAll()"
          ></vis-save-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .template-manager {
      position: relative;
    }
    
    .template-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn-template {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    
    .btn-template:hover {
      background-color: #e9ecef;
    }
    
    .template-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .template-modal-content {
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 1200px;
      max-height: 90vh;
      overflow-y: auto;
    }
  `]
})
export class TemplateManagerComponent {
  @Input() dashboardConfig: any;
  @Output() templateLoaded = new EventEmitter<IDashboardTemplate>();
  @Output() templateSaved = new EventEmitter<IDashboardTemplate>();
  
  showGallery: boolean = false;
  showSaveForm: boolean = false;
  
  openGallery(): void {
    this.showGallery = true;
    this.showSaveForm = false;
  }
  
  openSaveForm(): void {
    this.showSaveForm = true;
    this.showGallery = false;
  }
  
  closeAll(): void {
    this.showGallery = false;
    this.showSaveForm = false;
  }
  
  onTemplateSelected(template: IDashboardTemplate): void {
    this.templateLoaded.emit(template);
    this.closeAll();
  }
  
  onTemplateSaved(template: IDashboardTemplate): void {
    this.templateSaved.emit(template);
    this.closeAll();
  }
}