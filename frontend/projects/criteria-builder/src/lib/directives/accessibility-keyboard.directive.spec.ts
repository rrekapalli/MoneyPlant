import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccessibilityKeyboardDirective } from './accessibility-keyboard.directive';
import { AccessibilityService } from '../services/accessibility.service';
import { QueryToken } from '../models/token-system.interface';

@Component({
  template: `
    <div 
      acAccessibilityKeyboard
      [token]="token"
      [enableGlobalShortcuts]="true"
      [enableTokenNavigation]="true"
      (addCondition)="onAddCondition()"
      (deleteToken)="onDeleteToken($event)"
      (editToken)="onEditToken($event)">
      Test Element
    </div>
  `
})
class TestComponent {
  token: QueryToken = {
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

  onAddCondition = jasmine.createSpy('onAddCondition');
  onDeleteToken = jasmine.createSpy('onDeleteToken');
  onEditToken = jasmine.createSpy('onEditToken');
}

describe('AccessibilityKeyboardDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directive: AccessibilityKeyboardDirective;
  let directiveElement: DebugElement;
  let accessibilityService: jasmine.SpyObj<AccessibilityService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AccessibilityService', [
      'registerKeyboardShortcut',
      'unregisterKeyboardShortcut',
      'handleGlobalKeyboardEvent',
      'announceToScreenReader',
      'trapFocus'
    ]);

    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [AccessibilityKeyboardDirective],
      providers: [
        { provide: AccessibilityService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    accessibilityService = TestBed.inject(AccessibilityService) as jasmine.SpyObj<AccessibilityService>;
    
    directiveElement = fixture.debugElement.query(By.directive(AccessibilityKeyboardDirective));
    directive = directiveElement.injector.get(AccessibilityKeyboardDirective);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should register global shortcuts on init', () => {
    expect(accessibilityService.registerKeyboardShortcut).toHaveBeenCalledWith(
      'Ctrl+Enter',
      jasmine.any(Function)
    );
    expect(accessibilityService.registerKeyboardShortcut).toHaveBeenCalledWith(
      'Ctrl+Shift+Enter',
      jasmine.any(Function)
    );
  });

  describe('Token Keyboard Handling', () => {
    it('should handle Delete key for deletable tokens', () => {
      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      spyOn(event, 'preventDefault');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onDeleteToken).toHaveBeenCalledWith(component.token);
    });

    it('should handle F2 key for editable tokens', () => {
      const event = new KeyboardEvent('keydown', { key: 'F2' });
      spyOn(event, 'preventDefault');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onEditToken).toHaveBeenCalledWith(component.token);
    });

    it('should handle Enter key for editable tokens', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onEditToken).toHaveBeenCalledWith(component.token);
    });

    it('should handle Space key for editable tokens', () => {
      const event = new KeyboardEvent('keydown', { key: ' ' });
      spyOn(event, 'preventDefault');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onEditToken).toHaveBeenCalledWith(component.token);
    });

    it('should not handle keys for non-editable tokens', () => {
      component.token.isEditable = false;
      component.token.isDeletable = false;
      fixture.detectChanges();

      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      spyOn(event, 'preventDefault');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.onDeleteToken).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Keyboard Handling', () => {
    beforeEach(() => {
      directive.enableTokenNavigation = true;
    });

    it('should handle ArrowRight for navigation', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      spyOn(event, 'preventDefault');
      spyOn(directive.focusNext, 'emit');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(directive.focusNext.emit).toHaveBeenCalled();
    });

    it('should handle ArrowLeft for navigation', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      spyOn(event, 'preventDefault');
      spyOn(directive.focusPrevious, 'emit');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(directive.focusPrevious.emit).toHaveBeenCalled();
    });

    it('should handle Home key for navigation', () => {
      const event = new KeyboardEvent('keydown', { key: 'Home' });
      spyOn(event, 'preventDefault');
      spyOn(directive.focusFirst, 'emit');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(directive.focusFirst.emit).toHaveBeenCalled();
    });

    it('should handle End key for navigation', () => {
      const event = new KeyboardEvent('keydown', { key: 'End' });
      spyOn(event, 'preventDefault');
      spyOn(directive.focusLast, 'emit');
      
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(directive.focusLast.emit).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should set focused token on focus', () => {
      spyOn(accessibilityService, 'setFocusedToken');
      
      const focusEvent = new FocusEvent('focus');
      directiveElement.nativeElement.dispatchEvent(focusEvent);
      
      expect(accessibilityService.setFocusedToken).toHaveBeenCalledWith(component.token.id);
    });

    it('should clear focused token on blur when not moving to related element', () => {
      spyOn(accessibilityService, 'setFocusedToken');
      
      const blurEvent = new FocusEvent('blur', { relatedTarget: null });
      directiveElement.nativeElement.dispatchEvent(blurEvent);
      
      expect(accessibilityService.setFocusedToken).toHaveBeenCalledWith(null);
    });
  });

  describe('Global Shortcuts', () => {
    it('should handle global keyboard events when enabled', () => {
      directive.enableGlobalShortcuts = true;
      accessibilityService.handleGlobalKeyboardEvent.and.returnValue(true);
      
      const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(accessibilityService.handleGlobalKeyboardEvent).toHaveBeenCalledWith(event);
    });

    it('should not handle global keyboard events when disabled', () => {
      directive.enableGlobalShortcuts = false;
      
      const event = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true });
      directiveElement.nativeElement.dispatchEvent(event);
      
      expect(accessibilityService.handleGlobalKeyboardEvent).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should unregister shortcuts on destroy', () => {
      directive.ngOnDestroy();
      
      expect(accessibilityService.unregisterKeyboardShortcut).toHaveBeenCalled();
    });
  });
});