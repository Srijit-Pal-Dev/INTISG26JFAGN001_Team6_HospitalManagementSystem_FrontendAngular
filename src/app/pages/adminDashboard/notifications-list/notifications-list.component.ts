import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationResponse } from '../../../core/models/index';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-list.component.html',
  styleUrls: ['../adminDashboard.shared.css', './notifications-list.component.css']
})
export class NotificationsListComponent {

  @Input() notifications: NotificationResponse[] = [];
  @Input() isLoading = false;

  @Output() markRead    = new EventEmitter<NotificationResponse>();
  @Output() markAllRead = new EventEmitter<void>();

  getNotifDotClass(type: string): string {
    const map: Record<string, string> = {
      INFO: 'dot-info', WARNING: 'dot-warn',
      ERROR: 'dot-err', SUCCESS: 'dot-ok'
    };
    return map[type] || 'dot-info';
  }

  formatDate(instant: string): string {
    if (!instant) return '—';
    return new Date(instant).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}