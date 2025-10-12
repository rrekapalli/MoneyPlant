import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AcTokenRendererComponent } from './ac-token-renderer.component';
import { QueryToken, TokenType } from '../models/token-system.interface';

describe('AcTokenRendererComponent', () => {
  let component: AcTokenRendererComponent;
  let fixture: ComponentFixture<AcTokenRendererComponent>;
  let debugElement: DebugElement;

  const createMockToken = (type: TokenType, overrides: Partial<QueryToken> = {}): QueryToken => ({
    id: 'test-token-1',
    type,
    displayText: `Test ${type}`,
    value: 'test-value',
    depth: 0,
    position: 0,
    isEditable: true,
    isDeletable: true,
    hasDropdown: false,
    hasDialog: false,
    ...overrides
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcTokenRendererComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AcTokenRendererComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      component.token = createMockToken('field');
      expect(component).toBeTruthy();
    });

    it('should render token with correct display text', () => {
      component.token = createMockToken('field', { displayText: 'Price Field' });
      fixture.detectChanges();

      const tokenText = debugElement.query(By.css('.token-text'));
      expect(tokenText.nativeElement.textContent.trim()).toBe('Price Field');
    });
  });

  describe('Token Styling', () => {
    it('should apply correct CSS classes for field token', () => {
      component.token = createMockToken('field');
      fixture.detectChanges();

      const classes = component.getTokenClasses();
      expect(classes).toContain('token');
      expect(classes).toContain('token-field');
      expect(classes).toContain('token-editable');
      expect(classes).toContain('token-deletable');
    });

    it('should apply selected class when token is selected', () => {
      component.token = createMockToken('field');
      component.isSelected = true;
      fixture.detectChanges();

      const classes = component.getTokenClasses();
      expect(classes).toContain('token-selected');
    });

    it('should apply error class when token has error', () => {
      component.token = createMockToken('field');
      component.hasError = true;
      fixture.detectChanges();

      const classes = component.getTokenClasses();
      expect(classes).toContain('token-error');
    });

    it('should apply disabled class when token is disabled', () => {
      component.token = createMockToken('field');
      component.isDisabled = true;
      fixture.detectChanges();

      const classes = component.getTokenClasses();
      expect(classes).toContain('token-disabled');
    });

    it('should return correct styles for different token types', () => {
      const fieldToken = createMockToken('field');
      component.token = fieldToken;
      
      const styles = component.getTokenStyles();
      expect(styles['background-color']).toBe('#e3f2fd');
      expect(styles['border-color']).toBe('#2196f3');
      expect(styles['color']).toBe('#1976d2');
    });

    it('should return error styles when token has error', () => {
      component.token = createMockToken('field');
      component.hasError = true;
      
      const styles = component.getTokenStyles();
      expect(styles['border-color']).toBe('#f44336');
      expect(styles['color']).toBe('#f44336');
    });
  });

  describe('Token Interaction', () => {
    it('should emit tokenClick when clicked', () => {
      spyOn(component.tokenClick, 'emit');
      component.token = createMockToken('field');
      fixture.detectChanges();

      const tokenElement = debugElement.query(By.css('.token-container'));
      tokenElement.nativeElement.click();

      expect(component.tokenClick.emit).toHaveBeenCalled();
    });

    it('should emit tokenDoubleClick when double clicked', () => {
      spyOn(component.tokenDoubleClick, 'emit');
      component.token = createMockToken('field');
      fixture.detectChanges();

      const tokenElement = debugElement.query(By.css('.token-container'));
      tokenElement.nativeElement.dispatchEvent(new Event('dblclick'));

      expect(component.tokenDoubleClick.emit).toHaveBeenCalled();
    });

    it('should emit tokenRightClick when right clicked', () => {
      spyOn(component.tokenRightClick, 'emit');
      component.token = createMockToken('field');
      fixture.detectChanges();

      const tokenElement = debugElement.query(By.css('.token-container'));
      const rightClickEvent = new MouseEvent('contextmenu', { bubbles: true });
      tokenElement.nativeElement.dispatchEvent(rightClickEvent);

      expect(component.tokenRightClick.emit).toHaveBeenCalledWith(rightClickEvent);
    });

    it('should not emit events when disabled', () => {
      spyOn(component.tokenClick, 'emit');
      component.token = createMockToken('field');
      component.isDisabled = true;
      fixture.detectChanges();

      component.onTokenClick();
      expect(component.tokenClick.emit).not.toHaveBeenCalled();
    });

    it('should handle hover state correctly', () => {
      spyOn(component.tokenHover, 'emit');
      component.token = createMockToken('field');
      fixture.detectChanges();

      component.onTokenHover();
      expect(component.isHovered).toBe(true);
      expect(component.tokenHover.emit).toHaveBeenCalledWith(true);

      component.onTokenHoverLeave();
      expect(component.isHovered).toBe(false);
      expect(component.tokenHover.emit).toHaveBeenCalledWith(false);
    });

    it('should handle focus state correctly', () => {
      spyOn(component.tokenFocus, 'emit');
      component.token = createMockToken('field');
      fixture.detectChanges();

      component.onTokenFocus();
      expect(component.isFocused).toBe(true);
      expect(component.tokenFocus.emit).toHaveBeenCalledWith(true);

      component.onTokenBlur();
      expect(component.isFocused).toBe(false);
      expect(component.tokenFocus.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('Keyboard Interaction', () => {
    it('should handle Enter key to trigger click', () => {
      spyOn(component, 'onTokenClick');
      component.token = createMockToken('field');
      fixture.detectChanges();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onTokenKeyDown(enterEvent);

      expect(component.onTokenClick).toHaveBeenCalled();
    });

    it('should handle Space key to trigger click', () => {
      spyOn(component, 'onTokenClick');
      component.token = createMockToken('field');
      fixture.detectChanges();

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      component.onTokenKeyDown(spaceEvent);

      expect(component.onTokenClick).toHaveBeenCalled();
    });

    it('should handle Delete key to trigger deletion', () => {
      spyOn(component, 'onDeleteClick');
      component.token = createMockToken('field', { isDeletable: true });
      fixture.detectChanges();

      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' });
      component.onTokenKeyDown(deleteEvent);

      expect(component.onDeleteClick).toHaveBeenCalled();
    });

    it('should handle F2 key to trigger edit', () => {
      spyOn(component, 'onTokenDoubleClick');
      component.token = createMockToken('field', { isEditable: true });
      fixture.detectChanges();

      const f2Event = new KeyboardEvent('keydown', { key: 'F2' });
      component.onTokenKeyDown(f2Event);

      expect(component.onTokenDoubleClick).toHaveBeenCalled();
    });

    it('should not handle keys when disabled', () => {
      spyOn(component, 'onTokenClick');
      component.token = createMockToken('field');
      component.isDisabled = true;
      fixture.detectChanges();

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      component.onTokenKeyDown(enterEvent);

      expect(component.onTokenClick).not.toHaveBeenCalled();
    });
  });

  describe('Token Delete Functionality', () => {
    it('should emit tokenDelete when delete button is clicked', () => {
      spyOn(component.tokenDelete, 'emit');
      component.token = createMockToken('field', { isDeletable: true });
      component.isSelected = true;
      fixture.detectChanges();

      const deleteButton = debugElement.query(By.css('.token-delete'));
      expect(deleteButton).toBeTruthy();

      deleteButton.nativeElement.click();
      expect(component.tokenDelete.emit).toHaveBeenCalled();
    });

    it('should show delete button when token is hovered and deletable', () => {
      component.token = createMockToken('field', { isDeletable: true });
      component.isHovered = true;
      fixture.detectChanges();

      expect(component.shouldShowDeleteButton()).toBe(true);
    });

    it('should not show delete button when token is not deletable', () => {
      component.token = createMockToken('field', { isDeletable: false });
      component.isHovered = true;
      fixture.detectChanges();

      expect(component.shouldShowDeleteButton()).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      component.token = createMockToken('field', { 
        displayText: 'Price Field',
        tooltip: 'Select price field'
      });
      fixture.detectChanges();

      const tokenElement = debugElement.query(By.css('.token-container'));
      expect(tokenElement.nativeElement.getAttribute('role')).toBe('button');
      expect(tokenElement.nativeElement.getAttribute('tabindex')).toBe('0');
      expect(tokenElement.nativeElement.getAttribute('aria-label')).toContain('Field: Price Field');
    });

    it('should have correct ARIA attributes when disabled', () => {
      component.token = createMockToken('field');
      component.isDisabled = true;
      fixture.detectChanges();

      const tokenElement = debugElement.query(By.css('.token-container'));
      expect(tokenElement.nativeElement.getAttribute('tabindex')).toBe('-1');
      expect(tokenElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should include error message in ARIA label when token has error', () => {
      component.token = createMockToken('field', { 
        displayText: 'Price Field',
        errorMessage: 'Invalid field selection'
      });
      component.hasError = true;
      fixture.detectChanges();

      const ariaLabel = component.getAriaLabel();
      expect(ariaLabel).toContain('Has error: Invalid field selection');
    });
  });

  describe('Visual Indicators', () => {
    it('should show dropdown indicator when token has dropdown', () => {
      component.token = createMockToken('field', { hasDropdown: true });
      fixture.detectChanges();

      expect(component.shouldShowDropdownIndicator()).toBe(true);
      const indicator = debugElement.query(By.css('.token-dropdown-indicator'));
      expect(indicator).toBeTruthy();
    });

    it('should show dialog indicator when token has dialog', () => {
      component.token = createMockToken('function', { hasDialog: true });
      fixture.detectChanges();

      expect(component.shouldShowDialogIndicator()).toBe(true);
      const indicator = debugElement.query(By.css('.token-dialog-indicator'));
      expect(indicator).toBeTruthy();
    });

    it('should show error indicator when token has error', () => {
      component.token = createMockToken('field', { errorMessage: 'Test error' });
      component.hasError = true;
      fixture.detectChanges();

      expect(component.shouldShowErrorIndicator()).toBe(true);
      const indicator = debugElement.query(By.css('.token-error-indicator'));
      expect(indicator).toBeTruthy();
    });

    it('should show correct icon for token type', () => {
      component.token = createMockToken('field');
      fixture.detectChanges();

      const iconClass = component.getIconClass();
      expect(iconClass).toBe('pi pi-tag');
    });

    it('should use custom icon when provided', () => {
      component.token = createMockToken('field', { icon: 'pi pi-custom' });
      fixture.detectChanges();

      const iconClass = component.getIconClass();
      expect(iconClass).toBe('pi pi-custom');
    });
  });
});