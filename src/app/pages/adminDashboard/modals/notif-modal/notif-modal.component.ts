import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationResponse } from '../../../../core/models/index';

@Component({
  selector: 'app-notif-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notif-modal.component.html',
  styleUrls: ['../../adminDashboard.shared.css', './notif-modal.component.css']
})
export class NotifModalComponent {

  @Input() show = false;
  @Input() notifications: NotificationResponse[] = [];

  @Output() closed      = new EventEmitter<void>();
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