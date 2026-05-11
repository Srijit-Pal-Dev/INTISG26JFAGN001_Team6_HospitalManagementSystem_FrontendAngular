import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {

  @Input() unreadCount: number = 0;
  @Input() activeRoute: string = '';

  @Output() notifClicked  = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  isCollapsed = false;
  userRole: string | null = null;
  username: string | null = null;

  readonly NAV_ITEMS: Record<string, { label: string; route: string; icon: string }[]> = {
    ADMIN: [
      { label: 'User Management', route: 'user-management', icon: 'users'    },
      { label: 'Notifications',   route: 'notifications',   icon: 'bell'     },
    ],
    DOCTOR: [
      { label: 'Dashboard',     route: 'overview',      icon: 'dashboard' },
      { label: 'Notifications', route: 'notifications', icon: 'bell'      },
      { label: 'Settings',      route: 'settings',      icon: 'settings'  },
    ],
    PHARMACIST: [
      { label: 'Dashboard',     route: 'overview',      icon: 'dashboard' },
      { label: 'Notifications', route: 'notifications', icon: 'bell'      },
      { label: 'Settings',      route: 'settings',      icon: 'settings'  },
    ],
    LAB_TECHNICIAN: [
      { label: 'Dashboard',     route: 'overview',      icon: 'dashboard' },
      { label: 'Notifications', route: 'notifications', icon: 'bell'      },
    ],
    USER: [
      { label: 'Dashboard',     route: 'overview',      icon: 'dashboard' },
      { label: 'Notifications', route: 'notifications', icon: 'bell'      },
    ],
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userRole = this.authService.getRole();
    this.username = this.authService.getUsername();
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      this.isCollapsed = saved === 'true';
    }
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    if (window.innerWidth < 900) {
      this.isCollapsed = true;
    }
  }

  get navItems() {
    return this.NAV_ITEMS[this.userRole ?? 'USER'] ?? [];
  }

  get initials(): string {
    const name = this.username ?? '';
    return name
      .split(/[\s._@]/)
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  }

  get roleLabel(): string {
    const map: Record<string, string> = {
      ADMIN:          'Administrator',
      DOCTOR:         'Doctor',
      PHARMACIST:     'Pharmacist',
      LAB_TECHNICIAN: 'Lab Technician',
      USER:           'User',
    };
    return map[this.userRole ?? ''] ?? 'Staff';
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', String(this.isCollapsed));
  }

  isActive(route: string): boolean {
    return this.activeRoute === route;
  }

  onNavClick(item: { label: string; route: string; icon: string }) {
    if (item.route === 'notifications') {
      this.notifClicked.emit();
    }
  }

  onLogout() {
    this.logoutClicked.emit();
  }
}