import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, of } from 'rxjs';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';

// Local imports
import { FieldMetadataService } from '../../../services/field-metadata.service';
import { OperatorMetaResp, OperatorType } from '../../../interfaces/field-metadata.interface';
import { PopoverOption } from '../../../interfaces/popover-context.interface';

@Component({
  selector: 'mp-operators-tab',
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
    DividerModule
  ],
  templateUrl: './operators-tab.component.html',
  styleUrls: ['./operators-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatorsTabComponent implements OnInit, OnDestroy, OnChanges {
  @Input() fieldId: string | null = null;
  @Input() searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() operatorSelect = new EventEmitter<PopoverOption>();

  // Component state
  operators: OperatorMetaResp[] = [];
  filteredOperators: OperatorMetaResp[] = [];
  groupedOperators: { [type: string]: OperatorMetaResp[] } = {};
  operatorTypes: string[] = [];
  isLoading = false;
  error: string | null = null;

  // Logical operators (always available)
  private readonly logicalOperators: OperatorMetaResp[] = [
    {
      operatorId: 'AND',
      symbol: 'AND',
      name: 'Logical AND',
      description: 'Both conditions must be true',
      type: 'logical',
      operandCount: 2,
      compatibleTypes: [],
      requiresValue: false,
      precedence: 2,
      example: 'condition1 AND condition2'
    },
    {
      operatorId: 'OR',
      symbol: 'OR',
      name: 'Logical OR',
      description: 'Either condition can be true',
      type: 'logical',
      operandCount: 2,
      compatibleTypes: [],
      requiresValue: false,
      precedence: 1,
      example: 'condition1 OR condition2'
    },
    {
      operatorId: 'NOT',
      symbol: 'NOT',
      name: 'Logical NOT',
      description: 'Negates the condition',
      type: 'logical',
      operandCount: 1,
      compatibleTypes: [],
      requiresValue: false,
      precedence: 3,
      example: 'NOT condition'
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fieldMetadataService: FieldMetadataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOperators();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fieldId'] && !changes['fieldId'].firstChange) {
      this.loadOperators();
    }
    
    if (changes['searchTerm']) {
      this.filterOperators();
    }
  }

  /**
   * Load operators based on field ID or show logical operators
   */
  private loadOperators(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    if (this.fieldId) {
      // Load field-specific operators
      this.fieldMetadataService.getOperatorsForField(this.fieldId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (fieldOperators) => {
          // Combine field operators with logical operators
          this.operators = [...fieldOperators, ...this.logicalOperators];
          this.filterOperators();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading operators:', error);
          this.error = 'Failed to load operators';
          // Fallback to logical operators only
          this.operators = [...this.logicalOperators];
          this.filterOperators();
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      // Show only logical operators when no field is selected
      this.operators = [...this.logicalOperators];
      this.filterOperators();
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Handle search input changes
   */
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
    this.filterOperators();
  }

  /**
   * Handle operator selection
   */
  onOperatorSelect(operator: OperatorMetaResp): void {
    const option: PopoverOption = {
      id: operator.operatorId,
      label: operator.symbol,
      description: operator.description,
      category: operator.type,
      icon: this.getOperatorIcon(operator.type),
      disabled: false,
      data: operator,
      keywords: [operator.name, operator.symbol]
    };

    this.operatorSelect.emit(option);
  }

  /**
   * Filter operators based on search term
   */
  private filterOperators(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOperators = this.operators;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredOperators = this.operators.filter(operator => 
        operator.name.toLowerCase().includes(searchLower) ||
        operator.symbol.toLowerCase().includes(searchLower) ||
        operator.description?.toLowerCase().includes(searchLower)
      );
    }
    
    this.updateGroupedOperators();
  }

  /**
   * Update grouped operators by type
   */
  private updateGroupedOperators(): void {
    this.groupedOperators = {};
    this.operatorTypes = [];

    this.filteredOperators.forEach(operator => {
      const type = this.formatOperatorType(operator.type);
      if (!this.groupedOperators[type]) {
        this.groupedOperators[type] = [];
      }
      this.groupedOperators[type].push(operator);
    });

    // Sort operator types with logical operators first
    this.operatorTypes = Object.keys(this.groupedOperators).sort((a, b) => {
      if (a === 'Logical') return -1;
      if (b === 'Logical') return 1;
      return a.localeCompare(b);
    });
  }

  /**
   * Get icon for operator type
   */
  getOperatorIcon(type: OperatorType): string {
    const iconMap: { [key in OperatorType]: string } = {
      'comparison': 'pi pi-equals',
      'logical': 'pi pi-sitemap',
      'string': 'pi pi-font',
      'set': 'pi pi-list',
      'range': 'pi pi-arrows-h',
      'null': 'pi pi-question-circle',
      'pattern': 'pi pi-search'
    };
    return iconMap[type] || 'pi pi-filter';
  }

  /**
   * Format operator type for display
   */
  formatOperatorType(type: OperatorType): string {
    const typeMap: { [key in OperatorType]: string } = {
      'comparison': 'Comparison',
      'logical': 'Logical',
      'string': 'String',
      'set': 'Set',
      'range': 'Range',
      'null': 'Null Check',
      'pattern': 'Pattern'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Get operator type badge class
   */
  getOperatorTypeBadge(type: OperatorType): string {
    const badgeMap: { [key in OperatorType]: string } = {
      'comparison': 'p-badge-success',
      'logical': 'p-badge-info',
      'string': 'p-badge-warning',
      'set': 'p-badge-help',
      'range': 'p-badge-secondary',
      'null': 'p-badge-contrast',
      'pattern': 'p-badge-danger'
    };
    return badgeMap[type] || 'p-badge-info';
  }

  /**
   * Get operator precedence display
   */
  getPrecedenceText(precedence: number): string {
    const precedenceMap: { [key: number]: string } = {
      1: 'Low',
      2: 'Medium',
      3: 'High'
    };
    return precedenceMap[precedence] || precedence.toString();
  }

  /**
   * Check if operator has additional info
   */
  hasAdditionalInfo(operator: OperatorMetaResp): boolean {
    return !!(operator.example || operator.operandCount > 0);
  }

  /**
   * Get additional operator information
   */
  getAdditionalInfo(operator: OperatorMetaResp): string {
    const info: string[] = [];
    
    if (operator.operandCount > 0) {
      info.push(`${operator.operandCount} operand${operator.operandCount > 1 ? 's' : ''}`);
    }
    
    if (operator.requiresValue) {
      info.push('Requires value');
    }
    
    return info.join(', ');
  }

  /**
   * Track function for ngFor
   */
  trackByOperatorId(index: number, operator: OperatorMetaResp): string {
    return operator.operatorId;
  }

  /**
   * Track function for operator types
   */
  trackByType(index: number, type: string): string {
    return type;
  }

  /**
   * Retry loading operators
   */
  retryLoad(): void {
    this.loadOperators();
  }
}