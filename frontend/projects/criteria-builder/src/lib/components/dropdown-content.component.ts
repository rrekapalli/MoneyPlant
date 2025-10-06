import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { DropdownOption } from '../models/token-system.interface';
import { FieldMeta } from '../models/field-meta.interface';
import { FunctionMeta } from '../models/function-meta.interface';

/**
 * Dropdown content component for field, operator, and function selection
 * Provides searchable, categorized options with keyboard navigation
 */
@Component({
  selector: 'ac-dropdown-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dropdown-content.component.html',
  styleUrls: ['./dropdown-content.component.scss']
})
export class DropdownContentComponent implements OnInit, OnDestroy {
  @Input() overlayType: 'field' | 'operator' | 'function' | 'value' = 'field';
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue: any = null;
  @Input() fields: FieldMeta[] = [];
  @Input() functions: FunctionMeta[] = [];
  @Input() searchable: boolean = true;
  @Input() categorized: boolean = true;
  @Input() maxHeight: string = '300px';
  
  @Output() optionSelect = new EventEmitter<DropdownOption>();
  @Output() searchChange = new EventEmitter<string>();
  
  searchTerm = '';
  filteredOptions: DropdownOption[] = [];
  categorizedOptions: { [category: string]: DropdownOption[] } = {};
  selectedIndex = -1;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit() {
    this.setupSearch();
    this.initializeOptions();
    this.setupKeyboardNavigation();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Initializes options based on overlay type and input data
   */
  private initializeOptions() {
    let allOptions: DropdownOption[] = [];
    
    switch (this.overlayType) {
      case 'field':
        allOptions = this.buildFieldOptions();
        break;
      case 'function':
        allOptions = this.buildFunctionOptions();
        break;
      case 'operator':
        allOptions = this.buildOperatorOptions();
        break;
      case 'value':
        allOptions = this.options; // Use provided options for values
        break;
    }
    
    this.filteredOptions = allOptions;
    this.categorizeOptions();
  }
  
  /**
   * Builds field options from FieldMeta array
   */
  private buildFieldOptions(): DropdownOption[] {
    return this.fields.map(field => ({
      label: field.label,
      value: field.id,
      icon: this.getFieldIcon(field.dataType),
      category: field.category || 'General',
      description: field.description
    }));
  }
  
  /**
   * Builds function options from FunctionMeta array
   */
  private buildFunctionOptions(): DropdownOption[] {
    return this.functions.map(func => ({
      label: func.label,
      value: func.id,
      icon: 'pi pi-code',
      category: func.category || 'General',
      description: func.description
    }));
  }
  
  /**
   * Builds operator options (these would typically come from API)
   */
  private buildOperatorOptions(): DropdownOption[] {
    return this.options.length > 0 ? this.options : [
      { label: 'Equals', value: '=', icon: 'pi pi-equals', category: 'Comparison' },
      { label: 'Not Equals', value: '!=', icon: 'pi pi-not-equal', category: 'Comparison' },
      { label: 'Greater Than', value: '>', icon: 'pi pi-angle-right', category: 'Comparison' },
      { label: 'Less Than', value: '<', icon: 'pi pi-angle-left', category: 'Comparison' },
      { label: 'Greater or Equal', value: '>=', icon: 'pi pi-angle-double-right', category: 'Comparison' },
      { label: 'Less or Equal', value: '<=', icon: 'pi pi-angle-double-left', category: 'Comparison' },
      { label: 'Contains', value: 'LIKE', icon: 'pi pi-search', category: 'Text' },
      { label: 'Starts With', value: 'STARTS_WITH', icon: 'pi pi-arrow-right', category: 'Text' },
      { label: 'Ends With', value: 'ENDS_WITH', icon: 'pi pi-arrow-left', category: 'Text' },
      { label: 'In List', value: 'IN', icon: 'pi pi-list', category: 'List' },
      { label: 'Not In List', value: 'NOT_IN', icon: 'pi pi-ban', category: 'List' }
    ];
  }
  
  /**
   * Gets appropriate icon for field data type
   */
  private getFieldIcon(dataType: string): string {
    const iconMap: { [key: string]: string } = {
      'string': 'pi pi-font',
      'number': 'pi pi-hashtag',
      'integer': 'pi pi-hashtag',
      'date': 'pi pi-calendar',
      'boolean': 'pi pi-check-square',
      'enum': 'pi pi-list',
      'percent': 'pi pi-percentage',
      'currency': 'pi pi-dollar'
    };
    
    return iconMap[dataType] || 'pi pi-info-circle';
  }
  
  /**
   * Categorizes options for grouped display
   */
  private categorizeOptions() {
    if (!this.categorized) return;
    
    this.categorizedOptions = {};
    
    this.filteredOptions.forEach(option => {
      const category = option.category || 'Other';
      if (!this.categorizedOptions[category]) {
        this.categorizedOptions[category] = [];
      }
      this.categorizedOptions[category].push(option);
    });
    
    // Sort categories and options within categories
    Object.keys(this.categorizedOptions).forEach(category => {
      this.categorizedOptions[category].sort((a, b) => a.label.localeCompare(b.label));
    });
  }
  
  /**
   * Sets up search functionality with debouncing
   */
  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterOptions(searchTerm);
      this.searchChange.emit(searchTerm);
    });
  }
  
  /**
   * Filters options based on search term
   */
  private filterOptions(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.initializeOptions();
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.filteredOptions = this.filteredOptions.filter(option =>
      option.label.toLowerCase().includes(term) ||
      (option.description && option.description.toLowerCase().includes(term)) ||
      (option.category && option.category.toLowerCase().includes(term))
    );
    
    this.categorizeOptions();
    this.selectedIndex = -1;
    this.cdr.detectChanges();
  }
  
  /**
   * Handles search input changes
   */
  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchSubject.next(this.searchTerm);
  }
  
  /**
   * Handles option selection
   */
  onOptionSelect(option: DropdownOption) {
    if (option.disabled) return;
    
    this.selectedValue = option.value;
    this.optionSelect.emit(option);
  }
  
  /**
   * Checks if option is currently selected
   */
  isOptionSelected(option: DropdownOption): boolean {
    return this.selectedValue === option.value;
  }
  
  /**
   * Gets all categories for display
   */
  getCategories(): string[] {
    return Object.keys(this.categorizedOptions).sort();
  }
  
  /**
   * Gets options for a specific category
   */
  getOptionsForCategory(category: string): DropdownOption[] {
    return this.categorizedOptions[category] || [];
  }
  
  /**
   * Sets up keyboard navigation
   */
  private setupKeyboardNavigation() {
    // This would be implemented to handle arrow keys, enter, etc.
    // For now, basic implementation
  }
  
  /**
   * Handles keyboard navigation
   */
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateDown();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateUp();
        break;
      case 'Enter':
        event.preventDefault();
        this.selectCurrentOption();
        break;
      case 'Escape':
        event.preventDefault();
        // This would be handled by parent component
        break;
    }
  }
  
  /**
   * Navigates to next option
   */
  private navigateDown() {
    if (this.selectedIndex < this.filteredOptions.length - 1) {
      this.selectedIndex++;
    }
  }
  
  /**
   * Navigates to previous option
   */
  private navigateUp() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }
  
  /**
   * Selects currently highlighted option
   */
  private selectCurrentOption() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredOptions.length) {
      this.onOptionSelect(this.filteredOptions[this.selectedIndex]);
    }
  }
  
  /**
   * Gets icon text for display (since we're not using PrimeNG icons)
   */
  getIconText(iconClass: string): string {
    const iconMap: { [key: string]: string } = {
      'pi pi-font': '📝',
      'pi pi-hashtag': '#',
      'pi pi-calendar': '📅',
      'pi pi-check-square': '☑',
      'pi pi-list': '📋',
      'pi pi-percentage': '%',
      'pi pi-dollar': '$',
      'pi pi-code': '⚡',
      'pi pi-equals': '=',
      'pi pi-not-equal': '≠',
      'pi pi-angle-right': '>',
      'pi pi-angle-left': '<',
      'pi pi-angle-double-right': '≥',
      'pi pi-angle-double-left': '≤',
      'pi pi-search': '🔍',
      'pi pi-arrow-right': '→',
      'pi pi-arrow-left': '←',
      'pi pi-ban': '🚫'
    };
    
    return iconMap[iconClass] || '•';
  }
}