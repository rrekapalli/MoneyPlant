import { Injectable } from '@angular/core';
import { IFilterValues } from '../entities/IFilterValues';
import { IWidget } from '../entities/IWidget';
import { IFilterOptions } from '../entities/IFilterOptions';
import buildQuery from 'odata-query';

/**
 * Service for handling filter-related operations in dashboards
 * 
 * This service extracts filter logic from components to improve maintainability
 * and reusability across the application.
 */
@Injectable({
  providedIn: 'root'
})
export class FilterService {
  /**
   * Builds OData query parameters from the current filter values
   * 
   * @param filterValues - The current filter values to convert to OData parameters
   * @returns A string containing the OData query parameters
   */
  public getFilterParams(filterValues: IFilterValues[]): string {
    let params = '';
    if (filterValues.length !== 0) {
      const filtersParams: any = [];
      filterValues.map((item) => {
        filtersParams.push({
          [item.accessor]: item[item.accessor]
        });
      });
      const filter = {and: filtersParams};
      params = buildQuery({filter});
      params = params.replace('?$', '').replace('=', '') + '/';
    }
    return params;
  }

  /**
   * Finds the filter widget in the dashboard
   * 
   * @param widgets - Array of all widgets in the dashboard
   * @returns The filter widget if found, undefined otherwise
   */
  public findFilterWidget(widgets: IWidget[]): IWidget | undefined {
    return widgets.find(
      (item: IWidget) => item.config.component === 'filter'
    );
  }

  /**
   * Gets the current filter values from the filter widget
   * 
   * @param widgets - Array of all widgets in the dashboard
   * @returns Array of filter values if filter widget exists, empty array otherwise
   */
  public getFilterValues(widgets: IWidget[]): IFilterValues[] {
    const filterWidget = this.findFilterWidget(widgets);
    return (filterWidget?.config?.options as IFilterOptions)?.values || [];
  }

  /**
   * Updates a filter widget with new filter values
   * 
   * @param filterWidget - The filter widget to update
   * @param filterEvent - The filter event containing the new filter values
   * @returns The updated filter widget
   */
  public updateFilterWidget(filterWidget: IWidget, filterEvent: any): IWidget {
    const newFilterWidget = {...filterWidget};
    
    if (Array.isArray(filterEvent)) {
      (newFilterWidget.config.options as IFilterOptions).values = filterEvent;
    } else if ((newFilterWidget?.config?.options as IFilterOptions).values) {
      (newFilterWidget.config.options as IFilterOptions).values.push({
        accessor: filterEvent.widget.config.state.accessor,
        ...filterEvent.value
      });
    }
    
    return newFilterWidget;
  }
}