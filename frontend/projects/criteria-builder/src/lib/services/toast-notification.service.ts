import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  data?: any;
}

/**
 * Toast notification service for the criteria builder
 * Provides user feedback for actions, errors, and status updates
 */
@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  private messageIdCounter = 0;

  public messages$ = this.messagesSubject.asObservable();

  constructor() {}

  /**
   * Show a toast message
   */
  show(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
    life: number = 3000,
    sticky: boolean = false
  ): string {
    const message: ToastMessage = {
      id: this.generateId(),
      severity,
      summary,
      detail,
      life,
      sticky,
      closable: true
    };

    this.addMessage(message);
    return message.id;
  }

  /**
   * Show success message
   */
  showSuccess(summary: string, detail: string, life?: number): string {
    return this.show('success', summary, detail, life);
  }

  /**
   * Show info message
   */
  showInfo(summary: string, detail: string, life?: number): string {
    return this.show('info', summary, detail, life);
  }

  /**
   * Show warning message
   */
  showWarning(summary: string, detail: string, life?: number): string {
    return this.show('warn', summary, detail, life);
  }

  /**
   * Show error message
   */
  showError(summary: string, detail: string, life?: number): string {
    return this.show('error', summary, detail, life || 5000);
  }

  private addMessage(message: ToastMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);

    if (!message.sticky && message.life) {
      setTimeout(() => {
        this.removeMessage(message.id);
      }, message.life);
    }
  }

  private removeMessage(id: string): void {
    const currentMessages = this.messagesSubject.value;
    const filteredMessages = currentMessages.filter(msg => msg.id !== id);
    this.messagesSubject.next(filteredMessages);
  }

  private generateId(): string {
    return `toast-${++this.messageIdCounter}-${Date.now()}`;
  }
}