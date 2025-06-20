import { Injectable } from '@angular/core';

/**
 * Service for handling complex calculations related to dashboard widgets
 * 
 * This service extracts calculation logic from components to improve maintainability
 * and reusability across the application.
 */
@Injectable({
  providedIn: 'root'
})
export class CalculationService {
  /** Default chart height in pixels */
  readonly defaultChartHeight: number = 300;

  /**
   * Calculates the appropriate chart height based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @param flag - Optional flag to adjust height calculation
   * @param baseHeight - Base height to use for calculation (defaults to defaultChartHeight)
   * @returns The calculated chart height in pixels
   */
  public calculateChartHeight(cols: number, rows: number, flag: boolean = false, baseHeight: number = this.defaultChartHeight): number {
    // Base height for a standard container
    const baseContainerHeight = baseHeight;

    // Calculate aspect ratio
    const aspectRatio = cols / rows;
    const area = cols * rows;

    // Adjust zoom based on area
    // Larger area = more zoom out (smaller zoom number)
    const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling

    // Apply margin reduction (2.5% top and bottom = 5% total)
    const marginReduction = 0.95; // 100% - 5%

    // Adjust height based on an aspect ratio:
    // - Taller containers (rows > cols) get proportionally more height
    // - Wider containers (cols > rows) maintain base height
    let heightAdjustment = aspectRatio < 1 
      ? 1 / aspectRatio
      : 1;

    if(flag) {
      heightAdjustment = heightAdjustment * aspectRatio;
    }

    return Math.round(baseContainerHeight * heightAdjustment * marginReduction);
  }

  /**
   * Calculates the appropriate map center coordinates based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @returns An array of [longitude, latitude] for the map center
   */
  public calculateMapCenter(cols: number, rows: number): number[] {
    // Base center for a USA map
    const baseLongitude = -95;
    const baseLatitude = 38;

    // Adjust center based on an aspect ratio
    const aspectRatio = cols / rows;

    // Adjust longitude more for wider containers
    const longitudeAdjustment = (aspectRatio > 1) ? (aspectRatio - 1) * 5 : 0;

    // Adjust latitude more for taller containers
    const latitudeAdjustment = (aspectRatio < 1) ? ((1 / aspectRatio) - 1) * 2 : 0;

    return [
      baseLongitude + longitudeAdjustment,
      baseLatitude + latitudeAdjustment
    ];
  }

  /**
   * Calculates the appropriate map zoom level based on grid dimensions
   * 
   * @param cols - Number of columns in the grid
   * @param rows - Number of rows in the grid
   * @returns The calculated zoom level for the map
   */
  public calculateMapZoom(cols: number, rows: number): number {
    // Base zoom level
    const baseZoom = 4.0;

    // Calculate area of grid
    const area = cols * rows;

    // Adjust zoom based on area
    // Larger area = more zoom out (smaller zoom number)
    const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling

    // Calculate aspect ratio adjustment
    const aspectRatio = cols / rows;
    const aspectAdjustment = Math.abs(1 - aspectRatio) * 0.5;

    return baseZoom - (zoomAdjustment * 0.1) - aspectAdjustment;
  }
}