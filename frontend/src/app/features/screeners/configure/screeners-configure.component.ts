import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria } from '../../../services/entities/screener.entities';
import { CriteriaBuilderModule } from '@projects/criteria-builder';
import { CriteriaDSL, BuilderConfig } from '@projects/criteria-builder';

@Component({
  selector: 'app-screeners-configure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    CriteriaBuilderModule
  ],
  templateUrl: './screeners-configure.component.html',
  styleUrl: './screeners-configure.component.scss'
})
export class ScreenersConfigureComponent implements OnInit, OnChanges {
  @Input() selectedScreener: ScreenerResp | null = null;
  @Input() loading = false;
  @Input() universeOptions: any[] = [];
  @Input() criteriaConfig: BuilderConfig = {} as BuilderConfig;

  @Output() createScreener = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() saveScreener = new EventEmitter<ScreenerCreateReq>();
  @Output() criteriaChange = new EventEmitter<CriteriaDSL | null>();
  @Output() validityChange = new EventEmitter<boolean>();

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

  // Criteria DSL
  private _criteriaDSL: CriteriaDSL | null = null;

  get criteriaDSL(): CriteriaDSL | null {
    return this._criteriaDSL;
  }

  set criteriaDSL(value: CriteriaDSL | null) {
    this._criteriaDSL = value;
    this.criteriaChange.emit(value);
  }

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

  onCriteriaChange(dsl: CriteriaDSL | null): void {
    this._criteriaDSL = dsl;
    this.criteriaChange.emit(dsl);
  }

  onValidityChange(isValid: boolean): void {
    this.validityChange.emit(isValid);
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
}