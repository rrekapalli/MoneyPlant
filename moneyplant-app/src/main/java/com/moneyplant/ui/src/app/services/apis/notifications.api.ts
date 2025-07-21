import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Notification } from '../entities/notification';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly endpoint = '/notifications';

  constructor(private apiService: MockApiService) {}

  /**
   * Get all notifications
   * @returns An Observable of Notification array
   */
  getNotifications(): Observable<Notification[]> {
    return this.apiService.get<Notification[]>(this.endpoint);
  }

  /**
   * Get a specific notification by ID
   * @param id The notification ID
   * @returns An Observable of Notification
   */
  getNotificationById(id: string): Observable<Notification> {
    return this.apiService.get<Notification>(`${this.endpoint}/${id}`);
  }

  /**
   * Mark a notification as read
   * @param id The notification ID
   * @returns An Observable of the updated Notification
   */
  markAsRead(id: string): Observable<Notification> {
    return this.apiService.put<Notification>(`${this.endpoint}/${id}/read`, {});
  }

  /**
   * Mark all notifications as read
   * @returns An Observable of the operation result
   */
  markAllAsRead(): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/read-all`, {});
  }

  /**
   * Delete a notification
   * @param id The notification ID
   * @returns An Observable of the operation result
   */
  deleteNotification(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Delete all read notifications
   * @returns An Observable of the operation result
   */
  deleteAllReadNotifications(): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/read`);
  }
}
