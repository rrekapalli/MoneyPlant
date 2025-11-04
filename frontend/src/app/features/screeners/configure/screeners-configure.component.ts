import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria } from '../../../services/entities/screener.entities';
// Removed criteria-builder imports - functionality to be implemented later
// No environment import needed - using configuration-based approach instead

@Component({
  selector: 'app-screeners-configure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    MessageModule,

  ],
  templateUrl: './screeners-configure.component.html',
  styleUrl: './screeners-configure.component.scss'
})
export class ScreenersConfigureComponent implements OnInit, OnChanges {
  @Input() selectedScreener: ScreenerResp | null = null;
  @Input() loading = false;
  @Input() universeOptions: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  @Output() createScreener = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() saveScreener = new EventEmitter<ScreenerCreateReq>();

  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false,
    defaultUniverse: '',
    criteria: undefined
  };

  // Basic Info Edit State
  isEditingBasicInfo = false;
  originalBasicInfo: Partial<ScreenerCreateReq> = {};

  // Placeholder for future criteria builder configuration
  // This will be implemented when the criteria builder is added back


  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedScreener'] && changes['selectedScreener'].currentValue) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.selectedScreener) {
      this.screenerForm = {
        name: this.selectedScreener.name,
        description: this.selectedScreener.description || '',
        isPublic: this.selectedScreener.isPublic,
        defaultUniverse: this.selectedScreener.defaultUniverse || '',
        criteria: this.selectedScreener.criteria
      };
      
      // Reset edit state
      this.isEditingBasicInfo = false;
      this.originalBasicInfo = {};
    } else {
      this.screenerForm = {
        name: '',
        description: '',
        isPublic: false,
        defaultUniverse: '',
        criteria: undefined
      };
      this.isEditingBasicInfo = false;
      this.originalBasicInfo = {};
    }
  }

  onCreateScreener(): void {
    this.createScreener.emit();
  }

  onClearSelection(): void {
    this.clearSelection.emit();
  }

  onSaveScreener(): void {
    if (!this.screenerForm.name.trim()) {
      return;
    }
    
    this.saveScreener.emit(this.screenerForm);
  }


  onVisibilityChange(event: any): void {
    this.screenerForm.isPublic = event.target.checked;
  }

  // Basic Info Edit Methods
  toggleBasicInfoEdit(): void {
    if (this.isEditingBasicInfo) {
      // Save changes
      if (this.hasBasicInfoChanges()) {
        this.saveBasicInfoChanges();
      }
      this.isEditingBasicInfo = false;
    } else {
      // Enter edit mode
      this.isEditingBasicInfo = true;
      this.storeOriginalBasicInfo();
    }
  }

  private storeOriginalBasicInfo(): void {
    this.originalBasicInfo = {
      name: this.screenerForm.name,
      description: this.screenerForm.description,
      defaultUniverse: this.screenerForm.defaultUniverse,
      isPublic: this.screenerForm.isPublic
    };
  }

  hasBasicInfoChanges(): boolean {
    return (
      this.screenerForm.name !== this.originalBasicInfo.name ||
      this.screenerForm.description !== this.originalBasicInfo.description ||
      this.screenerForm.defaultUniverse !== this.originalBasicInfo.defaultUniverse ||
      this.screenerForm.isPublic !== this.originalBasicInfo.isPublic
    );
  }

  private saveBasicInfoChanges(): void {
    // Emit the save event to parent component
    this.onSaveScreener();
  }

  cancelBasicInfoEdit(): void {
    // Simple approach: always discard changes and exit edit mode
    this.discardBasicInfoChanges();
  }

  private discardBasicInfoChanges(): void {
    // Restore original values
    this.screenerForm.name = this.originalBasicInfo.name || '';
    this.screenerForm.description = this.originalBasicInfo.description || '';
    this.screenerForm.defaultUniverse = this.originalBasicInfo.defaultUniverse || '';
    this.screenerForm.isPublic = this.originalBasicInfo.isPublic || false;
    
    // Exit edit mode
    this.isEditingBasicInfo = false;
    this.originalBasicInfo = {};
  }

  // Placeholder methods for future criteria builder integration
  // These will be implemented when the criteria builder is added back
}