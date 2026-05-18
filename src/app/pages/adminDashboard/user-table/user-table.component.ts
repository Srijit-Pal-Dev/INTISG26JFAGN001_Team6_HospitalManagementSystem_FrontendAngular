import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResponse, RoleName } from '../../../core/models/index';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.component.html',
  styleUrls: ['../adminDashboard.shared.css', './user-table.component.css']
})
export class UserTableComponent {

  @Input() users:        UserResponse[] = [];
  @Input() totalUsers:   number = 0;
  @Input() activeFilter: string = 'all';
  @Input() isLoading:    boolean = false;

  @Output() filterChanged  = new EventEmitter<string>();
  @Output() viewUser       = new EventEmitter<UserResponse>();
  @Output() deleteUser     = new EventEmitter<UserResponse>();
  @Output() addUserClicked = new EventEmitter<void>();

  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(id: number): string {
    const colors = ['#2563c8','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#be185d'];
    return colors[id % colors.length];
  }

  getRoleBadgeClass(role: RoleName): string {
    const map: Record<string, string> = {
      ADMIN: 'badge-admin', DOCTOR: 'badge-doctor',
      NURSE: 'badge-nurse', PHARMACIST: 'badge-pharma',
      LAB_TECHNICIAN: 'badge-lab', USER: 'badge-user'
    };
    return map[role] || 'badge-user';
  }

  formatDate(instant: string): string {
    if (!instant) return '—';
    return new Date(instant).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}