import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationResponse } from '../../../core/models/index';

type FilterType = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-ph-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class PhNotificationsComponent implements OnInit {
  allNotifications: NotificationResponse[] = [];
  filter: FilterType = 'all';
  loading = false;
  error = '';
  markingAll = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  get currentUserId(): number {
    return this.authService.getUserId() ?? 0;
  }

  get filtered(): NotificationResponse[] {
    if (this.filter === 'unread') return this.allNotifications.filter(n => !n.read);
    if (this.filter === 'read')   return this.allNotifications.filter(n =>  n.read);
    return this.allNotifications;
  }

  get totalCount():  number { return this.allNotifications.length; }
  get unreadCount(): number { return this.allNotifications.filter(n => !n.read).length; }
  get readCount():   number { return this.allNotifications.filter(n =>  n.read).length; }
  get hasUnread():   boolean { return this.unreadCount > 0; }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.notificationService.getAllNotifications(this.currentUserId).subscribe({
      next: (data) => {
        this.allNotifications = data.slice().reverse();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load notifications. Please try again.';
        this.loading = false;
      }
    });
  }

  setFilter(f: FilterType): void {
    this.filter = f;
  }

  markAsRead(notif: NotificationResponse): void {
    if (notif.read) return;
    this.notificationService.markAsRead(notif.id).subscribe({
      next: (updated) => {
        this.allNotifications = this.allNotifications.map(n => n.id === updated.id ? updated : n);
      }
    });
  }

  markAllRead(): void {
    if (!this.hasUnread) return;
    this.markingAll = true;
    this.notificationService.markAllAsRead(this.currentUserId).subscribe({
      next: () => {
        this.allNotifications = this.allNotifications.map(n => ({ ...n, read: true }));
        this.markingAll = false;
      },
      error: () => { this.markingAll = false; }
    });
  }

  getDotClass(type: string): string {
    const map: Record<string, string> = {
      INFO:    'dot-info',
      WARNING: 'dot-warn',
      ERROR:   'dot-err',
      SUCCESS: 'dot-ok'
    };
    return map[type] || 'dot-info';
  }

  getBorderClass(type: string): string {
    const map: Record<string, string> = {
      INFO:    'border-info',
      WARNING: 'border-warn',
      ERROR:   'border-err',
      SUCCESS: 'border-ok'
    };
    return map[type] || 'border-info';
  }

  formatDate(instant: string): string {
    if (!instant) return '—';
    return new Date(instant).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
