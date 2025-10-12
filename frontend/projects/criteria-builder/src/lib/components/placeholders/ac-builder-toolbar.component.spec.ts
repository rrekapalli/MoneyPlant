import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

import { AcBuilderToolbarComponent } from './ac-builder-toolbar.component';
import { CriteriaDSL } from '../../models/criteria-dsl.interface';

describe('AcBuilderToolbarComponent', () => {
  let component: AcBuilderToolbarComponent;
  let fixture: ComponentFixture<AcBuilderToolbarComponent>;

  const mockDSL: CriteriaDSL = {
    root: {
      operator: 'AND',
      children: [
        {
          left: { fieldId: 'price' },
          op: '>',
          right: { type: 'number', value: 100 }
        }
      ]
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AcBuilderToolbarComponent],
      imports: [
        FormsModule,
        NoopAnimationsModule,
        ButtonModule,
        ToggleButtonModule,
        DialogModule,
        InputTextModule,
        TooltipModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcBuilderToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit mode change when toggle is clicked', () => {
    spyOn(component.modeChange, 'emit');
    component.mode = 'simple';
    
    component.onModeToggle();
    
    expect(component.modeChange.emit).toHaveBeenCalledWith('advanced');
  });

  it('should emit clear all when clear button is clicked', () => {
    spyOn(component.clearAll, 'emit');
    component.currentDSL = mockDSL;
    
    // Mock window.confirm to return true
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.onClearAll();
    
    expect(component.clearAll.emit).toHaveBeenCalled();
  });

  it('should not emit clear all when user cancels confirmation', () => {
    spyOn(component.clearAll, 'emit');
    component.currentDSL = mockDSL;
    
    // Mock window.confirm to return false
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.onClearAll();
    
    expect(component.clearAll.emit).not.toHaveBeenCalled();
  });

  it('should handle export functionality', () => {
    spyOn(component.exportDSL, 'emit');
    component.currentDSL = mockDSL;
    
    // Mock document.createElement and URL.createObjectURL
    const mockLink = {
      href: '',
      download: '',
      click: jasmine.createSpy('click')
    };
    spyOn(document, 'createElement').and.returnValue(mockLink as any);
    spyOn(URL, 'createObjectURL').and.returnValue('mock-url');
    spyOn(URL, 'revokeObjectURL');
    
    component.onExport();
    
    expect(mockLink.click).toHaveBeenCalled();
    expect(component.exportDSL.emit).toHaveBeenCalled();
  });

  it('should handle import functionality with valid JSON', () => {
    spyOn(component.importDSL, 'emit');
    
    const mockFile = new File([JSON.stringify(mockDSL)], 'test.json', { type: 'application/json' });
    const mockEvent = {
      target: {
        files: [mockFile],
        value: ''
      }
    } as any;
    
    // Mock FileReader
    const mockFileReader = {
      onload: null as any,
      readAsText: jasmine.createSpy('readAsText').and.callFake(() => {
        mockFileReader.onload({ target: { result: JSON.stringify(mockDSL) } });
      })
    };
    spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);
    
    component.onFileSelected(mockEvent);
    
    expect(component.importDSL.emit).toHaveBeenCalledWith(mockDSL);
  });

  it('should save and load presets', () => {
    component.currentDSL = mockDSL;
    component.newPresetName = 'Test Preset';
    
    // Mock localStorage
    const mockStorage: { [key: string]: string } = {};
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      mockStorage[key] = value;
    });
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      return mockStorage[key] || null;
    });
    
    component.savePreset();
    
    expect(component.presets.length).toBe(1);
    expect(component.presets[0].name).toBe('Test Preset');
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should toggle SQL preview', () => {
    spyOn(component.sqlPreviewToggle, 'emit');
    component.showSqlPreview = false;
    
    component.onSqlPreviewToggle();
    
    expect(component.showSqlPreview).toBe(true);
    expect(component.sqlPreviewToggle.emit).toHaveBeenCalledWith(true);
  });

  it('should handle invalid JSON import gracefully', () => {
    spyOn(window, 'alert');
    
    const mockFile = new File(['invalid json'], 'test.json', { type: 'application/json' });
    const mockEvent = {
      target: {
        files: [mockFile],
        value: ''
      }
    } as any;
    
    // Mock FileReader
    const mockFileReader = {
      onload: null as any,
      readAsText: jasmine.createSpy('readAsText').and.callFake(() => {
        mockFileReader.onload({ target: { result: 'invalid json' } });
      })
    };
    spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);
    
    component.onFileSelected(mockEvent);
    
    expect(window.alert).toHaveBeenCalledWith('Error reading file. Please ensure it is a valid JSON file.');
  });

  it('should return correct hasContent value', () => {
    component.currentDSL = null;
    expect(component.hasContent).toBe(false);
    
    component.currentDSL = { root: { operator: 'AND', children: [] } };
    expect(component.hasContent).toBe(false);
    
    component.currentDSL = mockDSL;
    expect(component.hasContent).toBe(true);
  });

  it('should return correct mode display texts', () => {
    component.mode = 'simple';
    expect(component.modeDisplayText).toBe('Simple');
    expect(component.toggleModeText).toBe('Advanced');
    
    component.mode = 'advanced';
    expect(component.modeDisplayText).toBe('Advanced');
    expect(component.toggleModeText).toBe('Simple');
  });
});