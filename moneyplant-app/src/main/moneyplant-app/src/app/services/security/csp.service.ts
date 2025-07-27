import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { LoggingService } from '../logging.service';

/**
 * Content Security Policy (CSP) Service
 * 
 * This service provides methods for configuring and applying Content Security Policy
 * to protect the application from various attacks like XSS, clickjacking, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class CSPService {
  private readonly defaultPolicy = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"]
  };

  constructor(
    private meta: Meta,
    private loggingService: LoggingService
  ) {}

  /**
   * Apply the Content Security Policy to the application
   * 
   * @param policy Optional custom policy to override the default
   */
  applyPolicy(policy: Partial<Record<string, string[]>> = {}): void {
    try {
      // Merge custom policy with default policy
      const mergedPolicy: Record<string, string[]> = { ...this.defaultPolicy };

      Object.entries(policy).forEach(([directive, sources]) => {
        if (sources !== undefined) {
          mergedPolicy[directive] = sources;
        }
      });

      // Convert policy object to CSP string
      const cspString = this.policyToString(mergedPolicy);

      // Add CSP meta tag
      this.meta.addTag({
        name: 'Content-Security-Policy',
        content: cspString
      });

      this.loggingService.info(
        'Content Security Policy applied',
        { policy: mergedPolicy },
        'CSPService'
      );
    } catch (error) {
      this.loggingService.error(
        'Failed to apply Content Security Policy',
        error,
        'CSPService'
      );
    }
  }

  /**
   * Apply a strict Content Security Policy for production environments
   */
  applyStrictPolicy(): void {
    const strictPolicy = {
      ...this.defaultPolicy,
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"]
    };

    this.applyPolicy(strictPolicy);
  }

  /**
   * Apply a more permissive Content Security Policy for development environments
   */
  applyDevelopmentPolicy(): void {
    const devPolicy = {
      ...this.defaultPolicy,
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'connect-src': ["'self'", 'ws:', 'wss:'] // Allow WebSocket for hot reload
    };

    this.applyPolicy(devPolicy);
  }

  /**
   * Convert a policy object to a CSP string
   * 
   * @param policy The policy object
   * @returns The CSP string
   */
  private policyToString(policy: Record<string, string[]>): string {
    return Object.entries(policy)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }

  /**
   * Add a nonce to the CSP for a specific directive
   * 
   * @param directive The CSP directive to add the nonce to
   * @returns The generated nonce
   */
  generateNonce(directive: string = 'script-src'): string {
    const nonce = this.generateRandomNonce();

    // Get current CSP
    const cspTag = this.meta.getTag('name=Content-Security-Policy');
    if (!cspTag) {
      this.loggingService.warn(
        'No CSP meta tag found when trying to add nonce',
        null,
        'CSPService'
      );
      return nonce;
    }

    // Parse current CSP
    const cspString = cspTag.content;
    const directives = cspString.split(';').map(d => d.trim());

    // Find and update the specified directive
    const directiveIndex = directives.findIndex(d => d.startsWith(directive));
    if (directiveIndex >= 0) {
      directives[directiveIndex] = `${directives[directiveIndex]} 'nonce-${nonce}'`;
    } else {
      directives.push(`${directive} 'nonce-${nonce}'`);
    }

    // Update CSP meta tag
    this.meta.updateTag({
      name: 'Content-Security-Policy',
      content: directives.join('; ')
    });

    return nonce;
  }

  /**
   * Generate a random nonce for CSP
   * 
   * @returns A random nonce string
   */
  private generateRandomNonce(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
