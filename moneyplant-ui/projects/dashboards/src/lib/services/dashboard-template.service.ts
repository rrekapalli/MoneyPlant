import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IDashboardTemplate } from '../entities/IDashboardTemplate';

/**
 * Service for managing dashboard templates
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardTemplateService {
  // In-memory storage for pre-built templates
  private preBuiltTemplates: IDashboardTemplate[] = [
    // Example pre-built template
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'A comprehensive analytics dashboard with key metrics and visualizations',
      category: ['analytics', 'metrics'],
      thumbnailUrl: 'assets/templates/analytics-dashboard.png',
      isPreBuilt: true,
      dashboardConfig: {
        layout: {
          cols: 12,
          rowHeight: 50,
          margins: [10, 10]
        },
        widgets: [
          // Example widgets would be defined here
        ],
        settings: {
          theme: 'light',
          refreshInterval: 0
        }
      }
    },
    // Add more pre-built templates as needed
  ];

  // Local storage key for user templates
  private readonly USER_TEMPLATES_KEY = 'dashboard_user_templates';

  constructor(private http: HttpClient) { }

  /**
   * Gets all available templates (both pre-built and user-created)
   */
  getAllTemplates(): Observable<IDashboardTemplate[]> {
    return this.getUserTemplates().pipe(
      map(userTemplates => [...this.preBuiltTemplates, ...userTemplates])
    );
  }

  /**
   * Gets all pre-built templates
   */
  getPreBuiltTemplates(): Observable<IDashboardTemplate[]> {
    return of(this.preBuiltTemplates);
  }

  /**
   * Gets user-created templates from local storage
   */
  getUserTemplates(): Observable<IDashboardTemplate[]> {
    try {
      const templatesJson = localStorage.getItem(this.USER_TEMPLATES_KEY);
      const templates = templatesJson ? JSON.parse(templatesJson) : [];
      return of(templates);
    } catch (error) {
      console.error('Error loading user templates:', error);
      return of([]);
    }
  }

  /**
   * Gets a template by ID
   */
  getTemplateById(id: string): Observable<IDashboardTemplate> {
    // First check pre-built templates
    const preBuiltTemplate = this.preBuiltTemplates.find(t => t.id === id);
    if (preBuiltTemplate) {
      return of(preBuiltTemplate);
    }

    // Then check user templates
    return this.getUserTemplates().pipe(
      map(templates => {
        const template = templates.find(t => t.id === id);
        if (!template) {
          throw new Error(`Template with ID ${id} not found`);
        }
        return template;
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Saves a user template
   */
  saveTemplate(template: IDashboardTemplate): Observable<IDashboardTemplate> {
    return this.getUserTemplates().pipe(
      map(templates => {
        // Generate ID if not provided
        if (!template.id) {
          template.id = this.generateId();
        }

        // Set timestamps
        const now = new Date();
        if (!template.createdAt) {
          template.createdAt = now;
        }
        template.updatedAt = now;

        // Check if template already exists
        const existingIndex = templates.findIndex(t => t.id === template.id);
        if (existingIndex >= 0) {
          // Update existing template
          templates[existingIndex] = template;
        } else {
          // Add new template
          templates.push(template);
        }

        // Save to local storage
        localStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(templates));
        return template;
      }),
      catchError(error => {
        console.error('Error saving template:', error);
        return throwError(() => new Error('Failed to save template'));
      })
    );
  }

  /**
   * Deletes a user template
   */
  deleteTemplate(id: string): Observable<boolean> {
    return this.getUserTemplates().pipe(
      map(templates => {
        const initialLength = templates.length;
        const filteredTemplates = templates.filter(t => t.id !== id);
        
        if (filteredTemplates.length === initialLength) {
          throw new Error(`Template with ID ${id} not found`);
        }
        
        localStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(filteredTemplates));
        return true;
      }),
      catchError(error => {
        console.error('Error deleting template:', error);
        return throwError(() => new Error('Failed to delete template'));
      })
    );
  }

  /**
   * Generates a unique ID for a template
   */
  private generateId(): string {
    return 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}