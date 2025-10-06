import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';
import { QueryToken } from '../models/token-system.interface';
import { CriteriaDSL } from '../models/criteria-dsl.interface';

describe('AccessibilityService', () => {
  let service: AccessibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Accessibility Mode Management', () => {
    it('should toggle high contrast mode', () => {
      service.setHighContrastMode(true);
      service.highContrastMode.subscribe(enabled => {
        expect(enabled).toBe(true);
      });
    });

    it('should toggle colorblind mode', () => {
      service.setColorBlindMode(true);
      service.colorBlindMode.subscribe(enabled => {
        expect(enabled).toBe(true);
      });
    });

    it('should toggle screen reader mode', () => {
      service.setScreenReaderMode(true);
      service.screenReaderMode.subscribe(enabled => {
        expect(enabled).toBe(true);
      });
    });
  });

  describe('ARIA Label Generation', () => {
    it('should generate comprehensive ARIA labels for tokens', () => {
      const token: QueryToken = {
        id: 'test-token',
        type: 'field',
        displayText: 'Price',
        value: 'price',
        depth: 0,
        position: 0,
        isEditable: true,
        isDeletable: true,
        hasDropdown: true,
        hasDialog: false
      };

      const label = service.generateTokenAriaLabel(token, {
        position: 0,
        total: 3,
        hasError: false
      });

      expect(label).toContain('Field: Price');
      expect(label).toContain('Position 1 of 3');
      expect(label).toContain('Press Enter or Space to edit');
      expect(label).toContain('Press Delete to remove');
      expect(label).toContain('Press Arrow Down to open options');
    });

    it('should include error information in ARIA labels', () => {
      const token: QueryToken = {
        id: 'test-token',
        type: 'value',
        displayText: 'invalid',
        value: 'invalid',
        depth: 0,
        position: 0,
        isEditable: true,
        isDeletable: true,
        hasDropdown: false,
        hasDialog: false,
        errorMessage: 'Invalid number format'
      };

      const label = service.generateTokenAriaLabel(token, {
        hasError: true,
        errorMessage: 'Invalid number format'
      });

      expect(label).toContain('Error: Invalid number format');
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce token changes', () => {
      const token: QueryToken = {
        id: 'test-token',
        type: 'field',
        displayText: 'Price',
        value: 'price',
        depth: 0,
        position: 0,
        isEditable: true,
        isDeletable: true,
        hasDropdown: false,
        hasDialog: false
      };

      spyOn(service, 'announceToScreenReader');
      service.announceTokenChange('Added', token, { position: 0 });

      expect(service.announceToScreenReader).toHaveBeenCalledWith('Added Field: Price at position 1');
    });

    it('should announce query structure changes', () => {
      const dsl: CriteriaDSL = {
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

      spyOn(service, 'announceToScreenReader');
      service.announceQueryStructure(dsl);

      expect(service.announceToScreenReader).toHaveBeenCalledWith('Query structure: 1 condition');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register and handle keyboard shortcuts', () => {
      const callback = jasmine.createSpy('callback');
      service.registerKeyboardShortcut('Ctrl+Enter', callback);

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true
      });

      const handled = service.handleGlobalKeyboardEvent(event);
      expect(handled).toBe(true);
      expect(callback).toHaveBeenCalled();
    });

    it('should unregister keyboard shortcuts', () => {
      const callback = jasmine.createSpy('callback');
      service.registerKeyboardShortcut('Ctrl+Enter', callback);
      service.unregisterKeyboardShortcut('Ctrl+Enter');

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true
      });

      const handled = service.handleGlobalKeyboardEvent(event);
      expect(handled).toBe(false);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should track focused token', () => {
      service.setFocusedToken('token-1');
      service.focusedTokenId.subscribe(id => {
        expect(id).toBe('token-1');
      });
    });

    it('should maintain focus history', () => {
      service.setFocusedToken('token-1');
      service.setFocusedToken('token-2');
      
      const previousId = service.focusPreviousToken();
      expect(previousId).toBe('token-1');
    });
  });

  describe('Visual Accessibility', () => {
    it('should provide high contrast styles', () => {
      service.setHighContrastMode(true);
      
      const token: QueryToken = {
        id: 'test-token',
        type: 'field',
        displayText: 'Price',
        value: 'price',
        depth: 0,
        position: 0,
        isEditable: true,
        isDeletable: true,
        hasDropdown: false,
        hasDialog: false
      };

      const baseStyles = {
        'background-color': '#e3f2fd',
        'color': '#1976d2'
      };

      const accessibleStyles = service.getTokenStylesForAccessibility(token, baseStyles);
      expect(accessibleStyles['border-width']).toBe('2px');
      expect(accessibleStyles['font-weight']).toBe('bold');
    });

    it('should provide colorblind patterns', () => {
      service.setColorBlindMode(true);
      
      const pattern = service.getTokenPatternForColorBlind('field');
      expect(pattern).toContain('repeating-linear-gradient');
    });

    it('should provide shape indicators', () => {
      const shape = service.getTokenShapeIndicator('field');
      expect(shape).toBe('■');
      
      const operatorShape = service.getTokenShapeIndicator('operator');
      expect(operatorShape).toBe('●');
    });
  });
});