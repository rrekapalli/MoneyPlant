import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'vis-dashboard-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule,
    SplitButtonModule,
    DropdownModule,
  ],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css'],
})
export class DashboardHeaderComponent implements OnInit, OnChanges {
  @Input() title: string = 'Dashboard';
  @Input() isHighlightingEnabled: boolean = true;
  @Input() isExportingExcel: boolean = false;
  
  @Output() onExportToExcel = new EventEmitter<void>();
  @Output() onToggleHighlighting = new EventEmitter<void>();
  @Output() onSetHighlightingPreset = new EventEmitter<'subtle' | 'medium' | 'strong'>();

  // Convert getter to property for better change detection
  menuItems: MenuItem[] = [];
  
  // Custom menu state
  showCustomMenu = false;

  ngOnChanges(changes: SimpleChanges): void {
    // Update menu items when inputs change
    if (changes['isHighlightingEnabled'] || changes['isExportingExcel']) {
      this.updateMenuItems();
    }
  }

  ngOnInit(): void {
    this.updateMenuItems();
  }

  // Create bound methods to avoid context issues
  private boundExportToExcel = () => {
    this.exportToExcel();
  };

  private boundToggleHighlighting = () => {
    this.toggleHighlighting();
  };

  private boundSetSubtle = () => {
    this.setHighlightingPreset('subtle');
  };

  private boundSetMedium = () => {  
    this.setHighlightingPreset('medium');
  };

  private boundSetStrong = () => {
    this.setHighlightingPreset('strong');
  };

  private updateMenuItems(): void {
    const items: MenuItem[] = [];
    
    // Add simple test menu items first to verify basic functionality
    items.push({
      label: '🧪 Simple Test',
      command: () => {
        alert('Simple test works!');
      }
    });
    
    items.push({
      separator: true
    });
    
    // Add export options - Excel only
    items.push({
      label: 'Export to Excel', 
      command: () => {
        this.exportToExcel();
      }
    });
    
    items.push({
      separator: true
    });
    
    // Add highlighting toggle with CORRECT logic
    items.push({
      label: this.isHighlightingEnabled ? 'Disable Highlighting' : 'Enable Highlighting',
      command: () => {
        this.toggleHighlighting();
      }
    });
    
    // Add highlighting presets ONLY if highlighting is enabled
    if (this.isHighlightingEnabled) {
      items.push({
        separator: true
      });
      
      items.push({
        label: 'Highlighting Intensity',
        items: [
          {
            label: 'Subtle (40%)',
            command: this.boundSetSubtle
          },
          {
            label: 'Medium (25%)',
            command: this.boundSetMedium
          },
          {
            label: 'Strong (10%)',
            command: this.boundSetStrong
          }
        ]
      });
    }
    
    this.menuItems = items;
  }

  exportToExcel() {
    this.onExportToExcel.emit();
  }

  toggleHighlighting() {
    this.onToggleHighlighting.emit();
    // Force menu rebuild after highlighting state changes
    setTimeout(() => {
      this.updateMenuItems();
    }, 100);
  }

  setHighlightingPreset(preset: 'subtle' | 'medium' | 'strong') {
    this.onSetHighlightingPreset.emit(preset);
  }

  // Template event handlers
  onMenuButtonClick(event: any, menu: any) {
    menu.toggle(event);
  }

  onMenuShow() {
  }

  onMenuHide() {
  }

  // Test method for split button
  testMainAction() {
    alert('Split button main action works!');
  }

  // Custom menu methods
  toggleCustomMenu() {
    this.showCustomMenu = !this.showCustomMenu;
  }

  testCustomClick(action: string) {
    this.showCustomMenu = false; // Close menu
    
    switch (action) {
      case 'test':
        alert('Custom test menu item works!');
        break;
      case 'excel':
        this.exportToExcel();
        break;
      case 'toggle':
        this.toggleHighlighting();
        break;
      case 'subtle':
        this.setHighlightingPreset('subtle');
        break;
      case 'medium':
        this.setHighlightingPreset('medium');
        break;
      case 'strong':
        this.setHighlightingPreset('strong');
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showCustomMenu) {
      const targetElement = event.target as HTMLElement;
      if (targetElement && !targetElement.closest('.custom-menu-container')) {
        this.showCustomMenu = false;
      }
    }
  }
} 