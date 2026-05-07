import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../core/services/user.service';
import { NotificationService } from '../core/services/notification.service';
import {
  UserResponse,
  CreateUserRequest,
  NotificationResponse,
  RoleName
} from '../core/models/index';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // ── State ──
  users = signal<UserResponse[]>([]);
  notifications = signal<NotificationResponse[]>([]);
  filteredUsers = signal<UserResponse[]>([]);

  // ── UI flags ──
  isLoadingUsers = false;
  isLoadingNotifs = false;
  showAddModal = false;
  showViewModal = false;
  showDeleteModal = false;
  showNotifModal = false;
  isSubmitting = false;

  // ── Search & filter ──
  searchQuery = '';
  activeFilter = 'all';

  // ── Selected user ──
  selectedUser: UserResponse | null = null;

  // ── Stats ──
  totalUsers = 0;
  activeUsers = 0;
  enabledUsers = 0;
  disabledUsers = 0;

  // ── Unread count ──
  unreadCount = 0;

  // ── Toast ──
  toastMessage = '';
  toastType: 'ok' | 'err' | 'info' = 'info';
  showToast = false;

  // ── Add user form ──
  newUser: CreateUserRequest & { confirmPassword: string } = {
    username: '',
    password: '',
    fullName: '',
    roles: [],
    confirmPassword: ''
  };
  selectedRole: RoleName = RoleName.DOCTOR;
  addError = '';

  // ── Search by ID/username ──
  searchById = '';
  searchByUsername = '';
  searchResult: UserResponse | null = null;
  searchError = '';

  // Expose RoleName enum to template
  RoleName = RoleName;

  readonly CURRENT_USER_ID = 1;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadNotifications();
  }

  // ── LOAD ALL USERS ──
  loadUsers() {
    this.isLoadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.applyFilter();
        this.updateStats();
        this.isLoadingUsers = false;
      },
      error: (err) => {
        this.isLoadingUsers = false;
        this.toast('Failed to load users', 'err');
      }
    });
  }

  // ── LOAD NOTIFICATIONS ──
  loadNotifications() {
    this.isLoadingNotifs = true;
    this.notificationService.getAllNotifications(this.CURRENT_USER_ID).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.unreadCount = data.filter(n => !n.read).length;
        this.isLoadingNotifs = false;
      },
      error: (err) => {
        this.isLoadingNotifs = false;
      }
    });
  }

  // ── STATS ──
  updateStats() {
    const all = this.users();
    this.totalUsers = all.length;
    this.enabledUsers = all.filter(u => u.enabled).length;
    this.disabledUsers = all.filter(u => !u.enabled).length;
    // No status field in backend — using enabled as proxy
    this.activeUsers = this.enabledUsers;
  }

  // ── FILTER ──
  applyFilter() {
    let result = [...this.users()];

    // Search filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.id.toString().includes(q) ||
        u.roles.some(r => r.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (this.activeFilter === 'enabled') {
      result = result.filter(u => u.enabled);
    } else if (this.activeFilter === 'disabled') {
      result = result.filter(u => !u.enabled);
    }

    this.filteredUsers.set(result);
  }

  onSearch() {
    this.applyFilter();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  // ── ADD USER ──
  openAddModal() {
    this.newUser = {
      username: '',
      password: '',
      fullName: '',
      roles: [RoleName.DOCTOR],
      confirmPassword: ''
    };
    this.selectedRole = RoleName.DOCTOR;
    this.addError = '';
    this.showAddModal = true;
  }

  selectRole(role: RoleName) {
    this.selectedRole = role;
    this.newUser.roles = [role];
  }

  submitAddUser() {
    this.addError = '';

    if (!this.newUser.username || !this.newUser.password ||
        !this.newUser.fullName || !this.newUser.roles.length) {
      this.addError = 'Please fill in all fields.';
      return;
    }

    if (this.newUser.password !== this.newUser.confirmPassword) {
      this.addError = 'Passwords do not match.';
      return;
    }

    if (this.newUser.password.length < 6) {
      this.addError = 'Password must be at least 6 characters.';
      return;
    }

    this.isSubmitting = true;

    const request: CreateUserRequest = {
      username: this.newUser.username,
      password: this.newUser.password,
      fullName: this.newUser.fullName,
      roles: this.newUser.roles
    };

    this.userService.createUser(request).subscribe({
      next: (user) => {
        this.isSubmitting = false;
        this.showAddModal = false;
        this.toast(`${user.fullName} created successfully`, 'ok');
        this.loadUsers();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.addError = err?.error?.message || 'Failed to create user.';
      }
    });
  }

  // ── VIEW USER ──
  viewUser(user: UserResponse) {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  // ── DELETE USER ──
  openDeleteModal(user: UserResponse) {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.selectedUser) return;
    this.isSubmitting = true;

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showDeleteModal = false;
        this.toast(`${this.selectedUser?.fullName} deleted`, 'err');
        this.selectedUser = null;
        this.loadUsers();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast('Failed to delete user', 'err');
      }
    });
  }

  // ── SEARCH BY ID ──
  onSearchById() {
    this.searchError = '';
    this.searchResult = null;
    const id = parseInt(this.searchById);
    if (!id) { this.searchError = 'Enter a valid numeric ID.'; return; }

    this.userService.getUserById(id).subscribe({
      next: (user) => { this.searchResult = user; },
      error: () => { this.searchError = 'No user found with that ID.'; }
    });
  }

  // ── SEARCH BY USERNAME ──
  onSearchByUsername() {
    this.searchError = '';
    this.searchResult = null;
    if (!this.searchByUsername.trim()) {
      this.searchError = 'Enter a username.';
      return;
    }

    this.userService.getUserByUsername(this.searchByUsername.trim()).subscribe({
      next: (user) => { this.searchResult = user; },
      error: () => { this.searchError = 'No user found with that username.'; }
    });
  }

  // ── NOTIFICATIONS ──
  openNotifModal() {
    this.showNotifModal = true;
  }

  markAsRead(notif: NotificationResponse) {
    if (notif.read) return;
    this.notificationService.markAsRead(notif.id).subscribe({
      next: (updated) => {
        const updated_list = this.notifications().map(n =>
          n.id === updated.id ? updated : n
        );
        this.notifications.set(updated_list);
        this.unreadCount = updated_list.filter(n => !n.read).length;
      }
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead(this.CURRENT_USER_ID).subscribe({
      next: () => {
        this.notifications.set(
          this.notifications().map(n => ({ ...n, read: true }))
        );
        this.unreadCount = 0;
        this.toast('All notifications marked as read', 'ok');
      }
    });
  }

  // ── HELPERS ──
  getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(id: number): string {
    const colors = ['#2563c8','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#be185d'];
    return colors[id % colors.length];
  }

  getRoleBadgeClass(role: RoleName): string {
    const map: Record<string, string> = {
      ADMIN: 'badge-admin',
      DOCTOR: 'badge-doctor',
      NURSE: 'badge-nurse',
      PHARMACIST: 'badge-pharma',
      LAB_TECHNICIAN: 'badge-lab',
      USER: 'badge-user'
    };
    return map[role] || 'badge-user';
  }

  getNotifDotClass(type: string): string {
    const map: Record<string, string> = {
      INFO: 'dot-info',
      WARNING: 'dot-warn',
      ERROR: 'dot-err',
      SUCCESS: 'dot-ok'
    };
    return map[type] || 'dot-info';
  }

  formatDate(instant: string): string {
    if (!instant) return '—';
    return new Date(instant).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  toast(message: string, type: 'ok' | 'err' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  closeModal(modal: 'add' | 'view' | 'delete' | 'notif') {
    if (modal === 'add') this.showAddModal = false;
    if (modal === 'view') this.showViewModal = false;
    if (modal === 'delete') this.showDeleteModal = false;
    if (modal === 'notif') this.showNotifModal = false;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  getRolesList(roles: RoleName[]): string {
    return roles.join(', ');
  }
}