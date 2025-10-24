import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// Local imports
import { FieldMetadataService } from '../../../services/field-metadata.service';
import { FunctionMetaResp, FunctionSignatureResp, FunctionCategory } from '../../../interfaces/field-metadata.interface';
import { PopoverOption } from '../../../interfaces/popover-context.interface';

@Component({
  selector: 'mp-functions-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ListboxModule,
    ProgressSpinnerModule,
    MessageModule,
    AccordionModule,
    BadgeModule,
    DividerModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './functions-tab.component.html',
  styleUrls: ['./functions-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionsTabComponent implements OnInit, OnDestroy, OnChanges {
  @Input() category: 'math' | 'indicators' = 'math';
  @Input() searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() functionSelect = new EventEmitter<PopoverOption>();

  // Component state
  functions: FunctionMetaResp[] = [];
  filteredFunctions: FunctionMetaResp[] = [];
  groupedFunctions: { [category: string]: FunctionMetaResp[] } = {};
  functionCategories: string[] = [];
  isLoading = false;
  error: string | null = null;

  // Function signature dialog
  showSignatureDialog = false;
  selectedFunction: FunctionMetaResp | null = null;
  functionSignature: FunctionSignatureResp | null = null;
  loadingSignature = false;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private fieldMetadataService: FieldMetadataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadFunctions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && !changes['category'].firstChange) {
      this.loadFunctions();
    }
    
    if (changes['searchTerm']) {
      this.filterFunctions();
    }
  }

  /**
   * Setup search functionality with debouncing
   */
  private setupSearch(): void {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.fieldMetadataService.searchFunctions(query)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (functions) => {
        this.filteredFunctions = this.filterByCategory(functions);
        this.updateGroupedFunctions();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error searching functions:', error);
        this.error = 'Failed to search functions';
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Load functions from the API
   */
  private loadFunctions(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.fieldMetadataService.getFunctions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (functions) => {
        this.functions = functions;
        this.filteredFunctions = this.filterByCategory(functions);
        this.updateGroupedFunctions();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading functions:', error);
        this.error = 'Failed to load functions';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Filter functions by current category
   */
  private filterByCategory(functions: FunctionMetaResp[]): FunctionMetaResp[] {
    if (this.category === 'math') {
      return functions.filter(func => 
        ['math', 'statistical', 'aggregation', 'logical', 'conversion'].includes(func.category)
      );
    } else {
      return functions.filter(func => func.category === 'indicators');
    }
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
   * Handle function selection
   */
  onFunctionSelect(func: FunctionMetaResp): void {
    const option: PopoverOption = {
      id: func.functionId,
      label: func.name,
      description: func.description,
      category: func.category,
      icon: func.icon || this.getFunctionIcon(func.category),
      disabled: func.deprecated,
      data: func,
      keywords: func.keywords
    };

    this.functionSelect.emit(option);
  }

  /**
   * Show function signature dialog
   */
  showFunctionSignature(func: FunctionMetaResp): void {
    this.selectedFunction = func;
    this.showSignatureDialog = true;
    this.loadFunctionSignature(func.functionId);
  }

  /**
   * Load function signature
   */
  private loadFunctionSignature(functionId: string): void {
    this.loadingSignature = true;
    this.functionSignature = null;
    this.cdr.markForCheck();

    this.fieldMetadataService.getFunctionSignature(functionId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (signature) => {
        this.functionSignature = signature;
        this.loadingSignature = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading function signature:', error);
        this.loadingSignature = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Close signature dialog
   */
  closeSignatureDialog(): void {
    this.showSignatureDialog = false;
    this.selectedFunction = null;
    this.functionSignature = null;
  }

  /**
   * Filter functions based on search term
   */
  private filterFunctions(): void {
    if (!this.searchTerm.trim()) {
      this.filteredFunctions = this.filterByCategory(this.functions);
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      const filtered = this.functions.filter(func => 
        func.name.toLowerCase().includes(searchLower) ||
        func.description?.toLowerCase().includes(searchLower) ||
        func.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
      this.filteredFunctions = this.filterByCategory(filtered);
    }
    
    this.updateGroupedFunctions();
  }

  /**
   * Update grouped functions by category
   */
  private updateGroupedFunctions(): void {
    this.groupedFunctions = {};
    this.functionCategories = [];

    this.filteredFunctions.forEach(func => {
      const category = this.formatFunctionCategory(func.category);
      if (!this.groupedFunctions[category]) {
        this.groupedFunctions[category] = [];
      }
      this.groupedFunctions[category].push(func);
    });

    this.functionCategories = Object.keys(this.groupedFunctions).sort();
  }

  /**
   * Get icon for function category
   */
  getFunctionIcon(category: FunctionCategory): string {
    const iconMap: { [key in FunctionCategory]: string } = {
      'math': 'pi pi-calculator',
      'indicators': 'pi pi-chart-line',
      'statistical': 'pi pi-chart-bar',
      'date': 'pi pi-calendar',
      'string': 'pi pi-font',
      'aggregation': 'pi pi-th-large',
      'logical': 'pi pi-sitemap',
      'conversion': 'pi pi-refresh'
    };
    return iconMap[category] || 'pi pi-cog';
  }

  /**
   * Format function category for display
   */
  formatFunctionCategory(category: FunctionCategory): string {
    const categoryMap: { [key in FunctionCategory]: string } = {
      'math': 'Mathematical',
      'indicators': 'Technical Indicators',
      'statistical': 'Statistical',
      'date': 'Date & Time',
      'string': 'String Functions',
      'aggregation': 'Aggregation',
      'logical': 'Logical',
      'conversion': 'Type Conversion'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  /**
   * Get function category badge class
   */
  getFunctionCategoryBadge(category: FunctionCategory): string {
    const badgeMap: { [key in FunctionCategory]: string } = {
      'math': 'p-badge-success',
      'indicators': 'p-badge-info',
      'statistical': 'p-badge-warning',
      'date': 'p-badge-secondary',
      'string': 'p-badge-help',
      'aggregation': 'p-badge-contrast',
      'logical': 'p-badge-danger',
      'conversion': 'p-badge-primary'
    };
    return badgeMap[category] || 'p-badge-info';
  }

  /**
   * Get return type display
   */
  getReturnTypeDisplay(returnType: string): string {
    return returnType.charAt(0).toUpperCase() + returnType.slice(1);
  }

  /**
   * Check if function has additional info
   */
  hasAdditionalInfo(func: FunctionMetaResp): boolean {
    return !!(func.example);
  }

  /**
   * Get parameter count text
   */
  getParameterCountText(signature: FunctionSignatureResp): string {
    if (signature.variadic) {
      return `${signature.minParams}+ parameters`;
    } else if (signature.minParams === signature.maxParams) {
      return `${signature.minParams} parameter${signature.minParams !== 1 ? 's' : ''}`;
    } else {
      return `${signature.minParams}-${signature.maxParams || '∞'} parameters`;
    }
  }

  /**
   * Track function for ngFor
   */
  trackByFunctionId(index: number, func: FunctionMetaResp): string {
    return func.functionId;
  }

  /**
   * Track function for categories
   */
  trackByCategory(index: number, category: string): string {
    return category;
  }

  /**
   * Track function for parameters
   */
  trackByParameterName(index: number, param: any): string {
    return param.name || index.toString();
  }

  /**
   * Retry loading functions
   */
  retryLoad(): void {
    this.loadFunctions();
  }
}