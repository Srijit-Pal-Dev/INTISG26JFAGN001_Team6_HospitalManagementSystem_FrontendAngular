import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserResponse, RoleName } from '../../../../core/models/index';

@Component({
  selector: 'app-view-user-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-user-modal.component.html',
  styleUrls: ['../../adminDashboard.shared.css']
})
export class ViewUserModalComponent {

  @Input() show = false;
  @Input() selectedUser: UserResponse | null = null;

  @Output() closed          = new EventEmitter<void>();
  @Output() deleteRequested = new EventEmitter<UserResponse>();

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

  getRolesList(roles: RoleName[]): string { return roles.join(', '); }

  formatDate(instant: string): string {
    if (!instant) return '—';
    return new Date(instant).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}