import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

import { DropdownOption } from '../models/token-system.interface';
import { FieldMeta, FieldMetaResp, OperatorInfo, ValueSuggestion } from '../models/field-meta.interface';
import { FunctionMeta, FunctionMetaResp } from '../models/function-meta.interface';
import { CriteriaApiService } from '../services/criteria-api.service';

/**
 * Dropdown content component for field, operator, and function selection
 * Provides searchable, categorized options with keyboard navigation
 */
@Component({
  selector: 'ac-dropdown-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ProgressSpinnerModule,
    TooltipModule
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
  @Input() fieldId: string = ''; // For operator and value suggestions
  @Input() searchable: boolean = true;
  @Input() categorized: boolean = true;
  @Input() maxHeight: string = '300px';
  @Input() enableTooltips: boolean = true;
  @Input() showDescriptions: boolean = true;
  @Input() loadFromApi: boolean = true;
  
  @Output() optionSelect = new EventEmitter<DropdownOption>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() loadingChange = new EventEmitter<boolean>();
  
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('optionsList', { static: false }) optionsList?: ElementRef<HTMLDivElement>;
  
  searchTerm = '';
  filteredOptions: DropdownOption[] = [];
  categorizedOptions: { [category: string]: DropdownOption[] } = {};
  selectedIndex = -1;
  isLoading = false;
  loadingError: string | null = null;
  
  // API-driven data
  apiFields: FieldMetaResp[] = [];
  apiFunctions: FunctionMetaResp[] = [];
  apiOperators: OperatorInfo[] = [];
  apiValueSuggestions: ValueSuggestion[] = [];
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  constructor(
    private cdr: ChangeDetectorRef,
    private criteriaApiService: CriteriaApiService
  ) {}
  
  ngOnInit() {
    this.setupSearch();
    this.loadApiData();
    this.setupKeyboardNavigation();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Loads data from API based on overlay type
   */
  private loadApiData() {
    if (!this.loadFromApi) {
      this.initializeOptions();
      return;
    }

    this.setLoading(true);
    this.loadingError = null;

    switch (this.overlayType) {
      case 'field':
        this.loadFields();
        break;
      case 'function':
        this.loadFunctions();
        break;
      case 'operator':
        this.loadOperators();
        break;
      case 'value':
        this.loadValueSuggestions();
        break;
      default:
        this.initializeOptions();
        break;
    }
  }

  /**
   * Loads fields from API with database-stored categorization
   */
  private loadFields() {
    this.criteriaApiService.getFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          this.apiFields = fields;
          this.initializeOptions();
          this.setLoading(false);
        },
        error: (error) => {
          console.error('Failed to load fields:', error);
          this.loadingError = 'Failed to load fields. Using fallback data.';
          this.initializeOptions(); // Use fallback data
          this.setLoading(false);
        }
      });
  }

  /**
   * Loads functions from criteria_functions table with search and category filtering
   */
  private loadFunctions() {
    this.criteriaApiService.getFunctions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (functions) => {
          this.apiFunctions = functions;
          this.initializeOptions();
          this.setLoading(false);
        },
        error: (error) => {
          console.error('Failed to load functions:', error);
          this.loadingError = 'Failed to load functions. Using fallback data.';
          this.initializeOptions(); // Use fallback data
          this.setLoading(false);
        }
      });
  }

  /**
   * Loads field-specific operators using field-specific operator API endpoint
   */
  private loadOperators() {
    if (!this.fieldId) {
      // Load all operators if no specific field
      this.criteriaApiService.getAllOperators()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (operators) => {
            this.apiOperators = operators;
            this.initializeOptions();
            this.setLoading(false);
          },
          error: (error) => {
            console.error('Failed to load operators:', error);
            this.loadingError = 'Failed to load operators. Using fallback data.';
            this.initializeOptions();
            this.setLoading(false);
          }
        });
    } else {
      // Load field-specific operators for compatibility filtering
      this.criteriaApiService.getFieldOperators(this.fieldId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (operators) => {
            this.apiOperators = operators;
            this.initializeOptions();
            this.setLoading(false);
          },
          error: (error) => {
            console.error(`Failed to load operators for field ${this.fieldId}:`, error);
            this.loadingError = 'Failed to load field operators. Using fallback data.';
            this.initializeOptions();
            this.setLoading(false);
          }
        });
    }
  }

  /**
   * Loads value suggestions using field suggestions API for dynamic completion
   */
  private loadValueSuggestions() {
    if (!this.fieldId) {
      this.initializeOptions();
      this.setLoading(false);
      return;
    }

    this.criteriaApiService.getFieldSuggestions(this.fieldId, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (suggestions) => {
          this.apiValueSuggestions = suggestions;
          this.initializeOptions();
          this.setLoading(false);
        },
        error: (error) => {
          console.error(`Failed to load value suggestions for field ${this.fieldId}:`, error);
          this.loadingError = 'Failed to load value suggestions.';
          this.initializeOptions();
          this.setLoading(false);
        }
      });
  }

  /**
   * Initializes options based on overlay type and loaded data
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
        allOptions = this.buildValueOptions();
        break;
    }
    
    this.filteredOptions = allOptions;
    this.categorizeOptions();
  }

  /**
   * Sets loading state and emits change
   */
  private setLoading(loading: boolean) {
    this.isLoading = loading;
    this.loadingChange.emit(loading);
    this.cdr.detectChanges();
  }
  
  /**
   * Builds field options from API data or fallback FieldMeta array
   */
  private buildFieldOptions(): DropdownOption[] {
    // Use API data if available, otherwise use input fields
    const fieldsToUse = this.apiFields.length > 0 ? this.apiFields : this.fields;
    
    return fieldsToUse.map(field => ({
      label: field.label,
      value: field.id,
      icon: this.getFieldIcon(field.dataType),
      category: field.category || 'General',
      description: field.description || field.example ? `${field.description || ''} ${field.example ? `(e.g., ${field.example})` : ''}`.trim() : undefined
    }));
  }
  
  /**
   * Builds function options from API data or fallback FunctionMeta array
   */
  private buildFunctionOptions(): DropdownOption[] {
    // Use API data if available, otherwise use input functions
    const functionsToUse = this.apiFunctions.length > 0 ? this.apiFunctions : this.functions;
    
    return functionsToUse.map(func => ({
      label: func.label,
      value: func.id,
      icon: 'pi pi-code',
      category: func.category || 'General',
      description: func.description,
      disabled: func.deprecated || false
    }));
  }
  
  /**
   * Builds operator options from API data or fallback options
   */
  private buildOperatorOptions(): DropdownOption[] {
    // Use API data if available, otherwise use provided options or fallback
    if (this.apiOperators.length > 0) {
      return this.apiOperators.map(op => ({
        label: op.label,
        value: op.id,
        icon: this.getOperatorIcon(op.id),
        category: this.getOperatorCategory(op.id),
        description: op.description
      }));
    }
    
    return this.options.length > 0 ? this.options : [
      { label: 'Equals', value: '=', icon: 'pi pi-equals', category: 'Comparison', description: 'Equal to' },
      { label: 'Not Equals', value: '!=', icon: 'pi pi-not-equal', category: 'Comparison', description: 'Not equal to' },
      { label: 'Greater Than', value: '>', icon: 'pi pi-angle-right', category: 'Comparison', description: 'Greater than' },
      { label: 'Less Than', value: '<', icon: 'pi pi-angle-left', category: 'Comparison', description: 'Less than' },
      { label: 'Greater or Equal', value: '>=', icon: 'pi pi-angle-double-right', category: 'Comparison', description: 'Greater than or equal to' },
      { label: 'Less or Equal', value: '<=', icon: 'pi pi-angle-double-left', category: 'Comparison', description: 'Less than or equal to' },
      { label: 'Contains', value: 'LIKE', icon: 'pi pi-search', category: 'Text', description: 'Contains text pattern' },
      { label: 'Starts With', value: 'STARTS_WITH', icon: 'pi pi-arrow-right', category: 'Text', description: 'Starts with text' },
      { label: 'Ends With', value: 'ENDS_WITH', icon: 'pi pi-arrow-left', category: 'Text', description: 'Ends with text' },
      { label: 'In List', value: 'IN', icon: 'pi pi-list', category: 'List', description: 'Value in list' },
      { label: 'Not In List', value: 'NOT_IN', icon: 'pi pi-ban', category: 'List', description: 'Value not in list' },
      { label: 'Is Null', value: 'IS NULL', icon: 'pi pi-circle', category: 'Null', description: 'Value is null' },
      { label: 'Is Not Null', value: 'IS NOT NULL', icon: 'pi pi-circle-fill', category: 'Null', description: 'Value is not null' }
    ];
  }

  /**
   * Builds value options from API suggestions or provided options
   */
  private buildValueOptions(): DropdownOption[] {
    // Use API suggestions if available, otherwise use provided options
    if (this.apiValueSuggestions.length > 0) {
      return this.apiValueSuggestions.map(suggestion => ({
        label: suggestion.label,
        value: suggestion.value,
        description: suggestion.description,
        category: 'Suggestions'
      }));
    }
    
    return this.options;
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
   * Gets appropriate icon for operator
   */
  private getOperatorIcon(operatorId: string): string {
    const iconMap: { [key: string]: string } = {
      '=': 'pi pi-equals',
      '!=': 'pi pi-not-equal',
      '>': 'pi pi-angle-right',
      '<': 'pi pi-angle-left',
      '>=': 'pi pi-angle-double-right',
      '<=': 'pi pi-angle-double-left',
      'LIKE': 'pi pi-search',
      'STARTS_WITH': 'pi pi-arrow-right',
      'ENDS_WITH': 'pi pi-arrow-left',
      'IN': 'pi pi-list',
      'NOT_IN': 'pi pi-ban',
      'IS NULL': 'pi pi-circle',
      'IS NOT NULL': 'pi pi-circle-fill'
    };
    
    return iconMap[operatorId] || 'pi pi-cog';
  }

  /**
   * Gets category for operator
   */
  private getOperatorCategory(operatorId: string): string {
    const categoryMap: { [key: string]: string } = {
      '=': 'Comparison',
      '!=': 'Comparison',
      '>': 'Comparison',
      '<': 'Comparison',
      '>=': 'Comparison',
      '<=': 'Comparison',
      'LIKE': 'Text',
      'STARTS_WITH': 'Text',
      'ENDS_WITH': 'Text',
      'IN': 'List',
      'NOT_IN': 'List',
      'IS NULL': 'Null',
      'IS NOT NULL': 'Null'
    };
    
    return categoryMap[operatorId] || 'Other';
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
   * Sets up search functionality with debouncing and API integration
   */
  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        // For value suggestions, reload from API with search term
        if (this.overlayType === 'value' && this.loadFromApi && this.fieldId) {
          this.setLoading(true);
          return this.criteriaApiService.getFieldSuggestions(this.fieldId, searchTerm)
            .pipe(
              catchError(error => {
                console.error('Search failed:', error);
                return of([]);
              })
            );
        }
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(suggestions => {
      if (suggestions !== null) {
        // Update value suggestions from API
        this.apiValueSuggestions = suggestions;
        this.initializeOptions();
        this.setLoading(false);
      } else {
        // Regular local filtering
        this.filterOptions(this.searchTerm);
      }
      this.searchChange.emit(this.searchTerm);
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
   * Sets up keyboard navigation and focus management
   */
  private setupKeyboardNavigation() {
    // Focus search input when component initializes
    setTimeout(() => {
      if (this.searchInput && this.searchable) {
        this.searchInput.nativeElement.focus();
      }
    }, 100);
  }

  /**
   * Focuses the search input
   */
  focusSearch() {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  /**
   * Scrolls to the currently selected option
   */
  private scrollToSelectedOption() {
    if (this.selectedIndex >= 0 && this.optionsList) {
      const optionElements = this.optionsList.nativeElement.querySelectorAll('.dropdown-option:not(.disabled)');
      const selectedElement = optionElements[this.selectedIndex] as HTMLElement;
      
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
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
   * Navigates to next option (skipping disabled options)
   */
  private navigateDown() {
    const enabledOptions = this.filteredOptions.filter(opt => !opt.disabled);
    if (enabledOptions.length === 0) return;
    
    let nextIndex = this.selectedIndex + 1;
    while (nextIndex < this.filteredOptions.length && this.filteredOptions[nextIndex].disabled) {
      nextIndex++;
    }
    
    if (nextIndex < this.filteredOptions.length) {
      this.selectedIndex = nextIndex;
    } else {
      // Wrap to first enabled option
      this.selectedIndex = this.filteredOptions.findIndex(opt => !opt.disabled);
    }
    
    this.scrollToSelectedOption();
  }
  
  /**
   * Navigates to previous option (skipping disabled options)
   */
  private navigateUp() {
    const enabledOptions = this.filteredOptions.filter(opt => !opt.disabled);
    if (enabledOptions.length === 0) return;
    
    let prevIndex = this.selectedIndex - 1;
    while (prevIndex >= 0 && this.filteredOptions[prevIndex].disabled) {
      prevIndex--;
    }
    
    if (prevIndex >= 0) {
      this.selectedIndex = prevIndex;
    } else {
      // Wrap to last enabled option
      for (let i = this.filteredOptions.length - 1; i >= 0; i--) {
        if (!this.filteredOptions[i].disabled) {
          this.selectedIndex = i;
          break;
        }
      }
    }
    
    this.scrollToSelectedOption();
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
      'pi pi-ban': '🚫',
      'pi pi-circle': '○',
      'pi pi-circle-fill': '●',
      'pi pi-cog': '⚙',
      'pi pi-info-circle': 'ℹ'
    };
    
    return iconMap[iconClass] || '•';
  }

  /**
   * Gets tooltip text for option
   */
  getTooltipText(option: DropdownOption): string {
    if (!this.enableTooltips) return '';
    
    let tooltip = option.description || '';
    
    // Add category info if available
    if (option.category && option.category !== 'General') {
      tooltip = tooltip ? `${option.category}: ${tooltip}` : option.category;
    }
    
    // Add disabled reason if applicable
    if (option.disabled) {
      tooltip = tooltip ? `${tooltip} (Disabled)` : 'This option is disabled';
    }
    
    return tooltip;
  }

  /**
   * Checks if option matches current search term
   */
  private matchesSearch(option: DropdownOption, searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    
    return option.label.toLowerCase().includes(term) ||
           (option.description && option.description.toLowerCase().includes(term)) ||
           (option.category && option.category.toLowerCase().includes(term)) ||
           (typeof option.value === 'string' && option.value.toLowerCase().includes(term));
  }

  /**
   * Gets the current flat list of options for keyboard navigation
   */
  getFlatOptionsList(): DropdownOption[] {
    return this.filteredOptions;
  }

  /**
   * Gets the index of an option in the flat list
   */
  getOptionIndex(option: DropdownOption): number {
    return this.filteredOptions.findIndex(opt => opt.value === option.value);
  }

  /**
   * Checks if an option is currently highlighted by keyboard navigation
   */
  isOptionHighlighted(option: DropdownOption): boolean {
    const index = this.getOptionIndex(option);
    return index === this.selectedIndex;
  }

  /**
   * Handles option hover for mouse navigation
   */
  onOptionHover(option: DropdownOption) {
    if (!option.disabled) {
      this.selectedIndex = this.getOptionIndex(option);
    }
  }

  /**
   * Reloads data from API (useful for refresh functionality)
   */
  refreshData() {
    if (this.loadFromApi) {
      this.loadApiData();
    } else {
      this.initializeOptions();
    }
  }

  /**
   * Clears the search term and resets options
   */
  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }
}