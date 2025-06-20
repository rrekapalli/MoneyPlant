import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterComponent } from './filter.component';
import { IWidget } from '../../entities/IWidget';
import { IFilterOptions } from '../../entities/IFilterOptions';
import { IFilterValues } from '../../entities/IFilterValues';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  // Mock widget data
  const mockWidget: any = {
    id: '1',
    type: 'filter',
    config: {
      options: {
        values: [
          { field: 'test', value: 'value1' },
          { field: 'test2', value: 'value2' }
        ]
      } as any
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    component.widget = { ...mockWidget }; // Create a fresh copy for each test
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filterValues getter/setter', () => {
    it('should get filter values when values exist', () => {
      const result = component.filterValues;
      expect(result).toEqual([
        { field: 'test', value: 'value1' },
        { field: 'test2', value: 'value2' }
      ] as any);
    });

    it('should return empty array when no values exist', () => {
      component.widget.config.options = { values: [] } as IFilterOptions;
      const result = component.filterValues;
      expect(result).toEqual([]);
    });

    it('should set filter values when values are provided', () => {
      const newValues: IFilterValues[] = [
        { field: 'newField', value: 'newValue' } as any
      ];
      component.filterValues = newValues;
      expect((component.widget.config.options as IFilterOptions).values).toEqual(newValues);
    });

    it('should not set filter values when empty array is provided', () => {
      const originalValues = (component.widget.config.options as IFilterOptions).values;
      component.filterValues = [];
      expect((component.widget.config.options as IFilterOptions).values).toEqual(originalValues);
    });
  });

  describe('clearAllFilters', () => {
    it('should clear all filters when item is provided', () => {
      component.clearAllFilters({});
      expect(component.filterValues).toEqual([]);
      expect((component.widget.config.options as IFilterOptions).values).toEqual([]);
    });

    it('should not clear filters when no item is provided', () => {
      const originalValues = component.filterValues;
      component.clearAllFilters(null);
      expect(component.filterValues).toEqual(originalValues);
    });
  });

  describe('clearFilter', () => {
    it('should remove specific filter when valid item is provided', () => {
      const itemToRemove = { field: 'test', value: 'value1' };
      component.clearFilter(itemToRemove);
      expect(component.filterValues).toEqual([{ field: 'test2', value: 'value2' } as any]);
    });

    it('should not modify filters when empty item is provided', () => {
      const originalValues = component.filterValues;
      component.clearFilter({});
      expect(component.filterValues).toEqual(originalValues);
    });

    it('should handle non-existent filter item', () => {
      const nonExistentItem = { field: 'nonexistent', value: 'none' };
      const originalValues = component.filterValues;
      component.clearFilter(nonExistentItem);
      expect(component.filterValues).toEqual(originalValues);
    });
  });
});
