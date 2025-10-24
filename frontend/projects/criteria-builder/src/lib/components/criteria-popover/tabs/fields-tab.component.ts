import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';

// Local imports
import { FieldMetadataService } from '../../../services/field-metadata.service';
import { FieldMetaResp } from '../../../interfaces/field-metadata.interface';
import { PopoverOption } from '../../../interfaces/popover-context.interface';

@Component({
  selector: 'mp-fields-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ListboxModule,
    ProgressSpinnerModule,
    MessageModule,
    AccordionModule,
    BadgeModule
  ],
  templateUrl: './fields-tab.component.html',
  styleUrls: ['./fields-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldsTabComponent implements OnInit, OnDestroy {
  @Input() searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() fieldSelect = new EventEmitter<PopoverOption>();

  // Component state
  fields: FieldMetaResp[] = [];
  filteredFields: FieldMetaResp[] = [];
  groupedFields: { [category: string]: FieldMetaResp[] } = {};
  categories: string[] = [];
  isLoading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private fieldMetadataService: FieldMetadataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadFields();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup search functionality with debouncing
   */
  private setupSearch(): void {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.fieldMetadataService.searchFields(query)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (fields) => {
        this.filteredFields = fields;
        this.updateGroupedFields();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error searching fields:', error);
        this.error = 'Failed to search fields';
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Load all fields from the API
   */
  private loadFields(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.fieldMetadataService.getFields().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (fields) => {
        this.fields = fields;
        this.filteredFields = fields;
        this.updateGroupedFields();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading fields:', error);
        this.error = 'Failed to load fields';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Handle search input changes
   */
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
    this.searchSubject$.next(value);
  }

  /**
   * Handle field selection
   */
  onFieldSelect(field: FieldMetaResp): void {
    const option: PopoverOption = {
      id: field.fieldId,
      label: field.name,
      description: field.description,
      category: field.category,
      icon: field.icon || this.getFieldTypeIcon(field.dataType),
      disabled: field.deprecated,
      data: field,
      keywords: field.keywords
    };

    this.fieldSelect.emit(option);
  }

  /**
   * Update grouped fields by category
   */
  private updateGroupedFields(): void {
    this.groupedFields = {};
    this.categories = [];

    this.filteredFields.forEach(field => {
      const category = field.category || 'Other';
      if (!this.groupedFields[category]) {
        this.groupedFields[category] = [];
      }
      this.groupedFields[category].push(field);
    });

    this.categories = Object.keys(this.groupedFields).sort();
  }

  /**
   * Get icon for field data type
   */
  getFieldTypeIcon(dataType: string): string {
    const iconMap: { [key: string]: string } = {
      'string': 'pi pi-font',
      'number': 'pi pi-hashtag',
      'integer': 'pi pi-hashtag',
      'decimal': 'pi pi-percentage',
      'boolean': 'pi pi-check-square',
      'date': 'pi pi-calendar',
      'datetime': 'pi pi-clock',
      'time': 'pi pi-clock',
      'enum': 'pi pi-list',
      'array': 'pi pi-th-large'
    };
    return iconMap[dataType] || 'pi pi-info-circle';
  }

  /**
   * Get field type badge class
   */
  getFieldTypeBadge(dataType: string): string {
    const badgeMap: { [key: string]: string } = {
      'string': 'p-badge-info',
      'number': 'p-badge-success',
      'integer': 'p-badge-success',
      'decimal': 'p-badge-success',
      'boolean': 'p-badge-warning',
      'date': 'p-badge-secondary',
      'datetime': 'p-badge-secondary',
      'time': 'p-badge-secondary',
      'enum': 'p-badge-help',
      'array': 'p-badge-contrast'
    };
    return badgeMap[dataType] || 'p-badge-info';
  }

  /**
   * Format field data type for display
   */
  formatDataType(dataType: string): string {
    return dataType.charAt(0).toUpperCase() + dataType.slice(1);
  }

  /**
   * Check if field has additional info to show
   */
  hasAdditionalInfo(field: FieldMetaResp): boolean {
    return !!(field.unit || field.minValue !== undefined || field.maxValue !== undefined);
  }

  /**
   * Get additional field information
   */
  getAdditionalInfo(field: FieldMetaResp): string {
    const info: string[] = [];
    
    if (field.unit) {
      info.push(`Unit: ${field.unit}`);
    }
    
    if (field.minValue !== undefined && field.maxValue !== undefined) {
      info.push(`Range: ${field.minValue} - ${field.maxValue}`);
    } else if (field.minValue !== undefined) {
      info.push(`Min: ${field.minValue}`);
    } else if (field.maxValue !== undefined) {
      info.push(`Max: ${field.maxValue}`);
    }
    
    return info.join(', ');
  }

  /**
   * Track function for ngFor
   */
  trackByFieldId(index: number, field: FieldMetaResp): string {
    return field.fieldId;
  }

  /**
   * Track function for categories
   */
  trackByCategory(index: number, category: string): string {
    return category;
  }

  /**
   * Retry loading fields
   */
  retryLoad(): void {
    this.loadFields();
  }
}