import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AccessibilityService } from '../../services/accessibility.service';

/**
 * Component for managing live announcements to screen readers
 */
@Component({
  selector: 'ac-live-announcer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Polite announcements -->
    <div 
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
      [attr.aria-label]="'Status updates'">
      {{ politeAnnouncement }}
    </div>
    
    <!-- Assertive announcements -->
    <div 
      class="sr-only"
      aria-live="assertive"
      aria-atomic="true"
      [attr.aria-label]="'Important updates'">
      {{ assertiveAnnouncement }}
    </div>
    
    <!-- Query structure description -->
    <div 
      class="sr-only"
      aria-live="polite"
      aria-atomic="false"
      [attr.aria-label]="'Query structure'">
      {{ queryStructureDescription }}
    </div>
  `,
  styles: [`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveAnnouncerComponent implements OnInit, OnDestroy {
  
  politeAnnouncement = '';
  assertiveAnnouncement = '';
  queryStructureDescription = '';
  
  private destroy$ = new Subject<void>();
  private politeTimeout?: number;
  private assertiveTimeout?: number;
  
  constructor(private accessibilityService: AccessibilityService) {}
  
  ngOnInit(): void {
    this.accessibilityService.announcements
      .pipe(takeUntil(this.destroy$))
      .subscribe(announcement => {
        this.handleAnnouncement(announcement);
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.politeTimeout) {
      clearTimeout(this.politeTimeout);
    }
    if (this.assertiveTimeout) {
      clearTimeout(this.assertiveTimeout);
    }
  }
  
  private handleAnnouncement(announcement: string): void {
    // Determine if this is an urgent announcement
    const isUrgent = this.isUrgentAnnouncement(announcement);
    
    if (isUrgent) {
      this.announceAssertive(announcement);
    } else {
      this.announcePolite(announcement);
    }
  }
  
  private announcePolite(message: string): void {
    this.politeAnnouncement = message;
    
    // Clear after 3 seconds to allow for new announcements
    if (this.politeTimeout) {
      clearTimeout(this.politeTimeout);
    }
    this.politeTimeout = window.setTimeout(() => {
      this.politeAnnouncement = '';
    }, 3000);
  }
  
  private announceAssertive(message: string): void {
    this.assertiveAnnouncement = message;
    
    // Clear after 2 seconds for urgent messages
    if (this.assertiveTimeout) {
      clearTimeout(this.assertiveTimeout);
    }
    this.assertiveTimeout = window.setTimeout(() => {
      this.assertiveAnnouncement = '';
    }, 2000);
  }
  
  private isUrgentAnnouncement(announcement: string): boolean {
    const urgentKeywords = [
      'error',
      'invalid',
      'failed',
      'warning',
      'deleted',
      'removed',
      'cleared'
    ];
    
    return urgentKeywords.some(keyword => 
      announcement.toLowerCase().includes(keyword)
    );
  }
  
  announceQueryStructure(description: string): void {
    this.queryStructureDescription = description;
    
    // Clear after 5 seconds
    setTimeout(() => {
      this.queryStructureDescription = '';
    }, 5000);
  }
}