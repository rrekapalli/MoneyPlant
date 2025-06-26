import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'vis-dashboard-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule,
  ],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css'],
})
export class DashboardHeaderComponent {
  @Input() title: string = 'Dashboard';
  @Input() isHighlightingEnabled: boolean = true;
  @Input() isExportingPdf: boolean = false;
  @Input() isExportingExcel: boolean = false;
  
  @Output() onExportToPdf = new EventEmitter<void>();
  @Output() onExportToExcel = new EventEmitter<void>();
  @Output() onToggleHighlighting = new EventEmitter<void>();
  @Output() onSetHighlightingPreset = new EventEmitter<'subtle' | 'medium' | 'strong'>();

  get menuItems(): MenuItem[] {
    const items: MenuItem[] = [];
    
    // Add export options
    items.push(
      {
        label: 'Export to PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.exportToPdf()
      },
      {
        label: 'Export to Excel',
        icon: 'pi pi-file-excel',
        command: () => this.exportToExcel()
      },
      {
        separator: true
      }
    );
    
    // Add highlighting toggle
    items.push({
      label: this.isHighlightingEnabled ? 'Disable Highlighting' : 'Enable Highlighting',
      icon: this.isHighlightingEnabled ? 'pi pi-eye-slash' : 'pi pi-eye',
      command: () => this.toggleHighlighting()
    });
    
    // Add highlighting presets if highlighting is enabled
    if (this.isHighlightingEnabled) {
      items.push(
        {
          separator: true
        },
        {
          label: 'Highlighting Intensity',
          icon: 'pi pi-sliders-h',
          items: [
            {
              label: 'Subtle (40%)',
              command: () => this.setHighlightingPreset('subtle')
            },
            {
              label: 'Medium (25%)',
              command: () => this.setHighlightingPreset('medium')
            },
            {
              label: 'Strong (10%)',
              command: () => this.setHighlightingPreset('strong')
            }
          ]
        }
      );
    }
    
    return items;
  }

  exportToPdf() {
    this.onExportToPdf.emit();
  }

  exportToExcel() {
    this.onExportToExcel.emit();
  }

  toggleHighlighting() {
    this.onToggleHighlighting.emit();
  }

  setHighlightingPreset(preset: 'subtle' | 'medium' | 'strong') {
    this.onSetHighlightingPreset.emit(preset);
  }
} 