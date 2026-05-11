import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import {
  UserResponse,
  CreateUserRequest,
  NotificationResponse,
  RoleName
} from '../../core/models/index';
import { SidebarComponent } from '../../components/sidebar/sidebar';

// ── Custom validator — password match ──
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password        = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent],
  templateUrl: './adminDashboard.component.html',
  styleUrls: ['./adminDashboard.component.css']
})
export class DashboardComponent implements OnInit {

  users               = signal<UserResponse[]>([]);
  notifications       = signal<NotificationResponse[]>([]);
  filteredUsers       = signal<UserResponse[]>([]);

  isLoadingUsers      = false;
  isLoadingNotifs     = false;
  showAddModal        = false;
  showViewModal       = false;
  showDeleteModal     = false;
  showNotifModal      = false;
  isSubmitting        = false;

  searchQuery         = '';
  activeFilter        = 'all';
  selectedUser: UserResponse | null = null;

  totalUsers          = 0;
  activeUsers         = 0;
  enabledUsers        = 0;
  disabledUsers       = 0;
  unreadCount         = 0;

  toastMessage        = '';
  toastType: 'ok' | 'err' | 'info' = 'info';
  showToast           = false;

  // ── Add User form ──
  addUserForm!: FormGroup;
  selectedRole: RoleName = RoleName.DOCTOR;
  addError = '';

  // ── Find User ──
  searchById          = '';
  searchByUsername    = '';
  searchResult: UserResponse | null = null;
  searchError         = '';

  // ── Password visibility ──
  showAddPassword        = false;
  showAddConfirmPassword = false;

  toggleAddPassword()        { this.showAddPassword        = !this.showAddPassword;        }
  toggleAddConfirmPassword() { this.showAddConfirmPassword = !this.showAddConfirmPassword; }

  RoleName = RoleName;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUserId(): number {
    return this.authService.getUserId() ?? 1;
  }

  ngOnInit() {
    this.buildAddUserForm();
    this.loadUsers();
    this.loadNotifications();
  }

  // ── Build Add User form ──
  private buildAddUserForm() {
    this.addUserForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(2)]],
      username:        ['', [Validators.required, Validators.minLength(3)]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['',  Validators.required]
    }, { validators: passwordMatchValidator });
  }

  // ── Accessors ──
  get af() { return this.addUserForm.controls; }

  addFieldError(field: string): string {
    const c = this.addUserForm.get(field);
    if (!c || !c.touched || !c.errors) return '';
    if (c.errors['required'])  return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters required.`;
    return '';
  }

  get addPasswordMismatch(): boolean {
    return !!this.addUserForm.errors?.['passwordMismatch'] &&
           !!this.addUserForm.get('confirmPassword')?.touched;
  }

  // ── Open Add Modal ──
  openAddModal() {
    this.addUserForm.reset();
    this.selectedRole = RoleName.DOCTOR;
    this.addError     = '';
    this.showAddPassword = false;
    this.showAddConfirmPassword = false;
    this.showAddModal = true;
  }

  selectRole(role: RoleName) {
    this.selectedRole = role;
  }

  // ── Submit Add User ──
  submitAddUser() {
    this.addError = '';
    this.addUserForm.markAllAsTouched();
    if (this.addUserForm.invalid) return;

    this.isSubmitting = true;

    const request: CreateUserRequest = {
      fullName: this.addUserForm.value.fullName.trim(),
      username: this.addUserForm.value.username.trim(),
      password: this.addUserForm.value.password,
      roles:    [this.selectedRole]
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

  // ── Load Users ──
  loadUsers() {
    this.isLoadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.applyFilter();
        this.updateStats();
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
        this.toast('Failed to load users', 'err');
      }
    });
  }

  // ── Load Notifications ──
  loadNotifications() {
    this.isLoadingNotifs = true;
    this.notificationService.getAllNotifications(this.currentUserId).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.unreadCount     = data.filter(n => !n.read).length;
        this.isLoadingNotifs = false;
      },
      error: () => { this.isLoadingNotifs = false; }
    });
  }

  updateStats() {
    const all         = this.users();
    this.totalUsers   = all.length;
    this.enabledUsers = all.filter(u => u.enabled).length;
    this.disabledUsers = all.filter(u => !u.enabled).length;
    this.activeUsers  = this.enabledUsers;
  }

  applyFilter() {
    let result = [...this.users()];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q)  ||
        u.id.toString().includes(q)           ||
        u.roles.some(r => r.toLowerCase().includes(q))
      );
    }
    if (this.activeFilter === 'enabled')  result = result.filter(u =>  u.enabled);
    if (this.activeFilter === 'disabled') result = result.filter(u => !u.enabled);
    this.filteredUsers.set(result);
  }

  onSearch()             { this.applyFilter(); }
  setFilter(f: string)   { this.activeFilter = f; this.applyFilter(); }

  viewUser(user: UserResponse) {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  openDeleteModal(user: UserResponse) {
    this.selectedUser    = user;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.selectedUser) return;
    this.isSubmitting = true;
    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.isSubmitting    = false;
        this.showDeleteModal = false;
        this.toast(`${this.selectedUser?.fullName} deleted`, 'err');
        this.selectedUser    = null;
        this.loadUsers();
      },
      error: () => {
        this.isSubmitting = false;
        this.toast('Failed to delete user', 'err');
      }
    });
  }

  onSearchById() {
    this.searchError  = '';
    this.searchResult = null;
    const id = parseInt(this.searchById);
    if (!id) { this.searchError = 'Enter a valid numeric ID.'; return; }
    this.userService.getUserById(id).subscribe({
      next: (user) => { this.searchResult = user; },
      error: ()     => { this.searchError = 'No user found with that ID.'; }
    });
  }

  onSearchByUsername() {
    this.searchError  = '';
    this.searchResult = null;
    if (!this.searchByUsername.trim()) {
      this.searchError = 'Enter a username.'; return;
    }
    this.userService.getUserByUsername(this.searchByUsername.trim()).subscribe({
      next: (user) => { this.searchResult = user; },
      error: ()     => { this.searchError = 'No user found with that username.'; }
    });
  }

  openNotifModal() { this.showNotifModal = true; }

  markAsRead(notif: NotificationResponse) {
    if (notif.read) return;
    this.notificationService.markAsRead(notif.id).subscribe({
      next: (updated) => {
        const list = this.notifications().map(n => n.id === updated.id ? updated : n);
        this.notifications.set(list);
        this.unreadCount = list.filter(n => !n.read).length;
      }
    });
  }

  markAllRead() {
    this.notificationService.markAllAsRead(this.currentUserId).subscribe({
      next: () => {
        this.notifications.set(this.notifications().map(n => ({ ...n, read: true })));
        this.unreadCount = 0;
        this.toast('All notifications marked as read', 'ok');
      }
    });
  }

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

  toast(message: string, type: 'ok' | 'err' | 'info') {
    this.toastMessage = message;
    this.toastType    = type;
    this.showToast    = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  closeModal(modal: 'add' | 'view' | 'delete' | 'notif') {
    if (modal === 'add')    this.showAddModal    = false;
    if (modal === 'view')   this.showViewModal   = false;
    if (modal === 'delete') this.showDeleteModal = false;
    if (modal === 'notif')  this.showNotifModal  = false;
  }

  logout() { this.authService.logout(); }

  getRolesList(roles: RoleName[]): string { return roles.join(', '); }
}