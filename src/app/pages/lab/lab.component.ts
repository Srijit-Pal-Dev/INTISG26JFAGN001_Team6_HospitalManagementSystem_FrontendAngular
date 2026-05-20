import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LabService } from '../../core/services/lab.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationResponse, NotificationType } from '../../core/models/index';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, SidebarComponent],
  templateUrl: './lab.component.html',
  styleUrls: ['./lab.component.css']
})
export class LabComponent implements OnInit {
  tests: any[] = [];
  isLoading = false;
  error = '';
  searchQuery = '';

  currentView: 'dashboard' | 'queue' = 'dashboard';
  activeFilter = 'all';

  // Modal
  selectedTest: any = null;
  showResultForm = false;
  resultForm = {
    resultValue: '',
    unit: '',
    referenceRange: '',
    recordedBy: '',
    notes: '',
    isAbnormal: false
  };

  // Notifications
  showNotifPanel = false;
  unreadCount = 0;
  notifications: NotificationResponse[] = [];

  currentUser = '';
  currentUserId = 0;
  today = new Date();

  // Expose enum to template
  readonly NotificationType = NotificationType;

  private readonly CIRCUMFERENCE = 2 * Math.PI * 48;
  private readonly STATUS_ORDER = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'];

  constructor(
    private labService: LabService,
    private authService: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUsername() || 'Lab Tech';
    this.currentUserId = this.authService.getUserId() || 0;
    this.loadTests();
    this.loadNotifications();
  }

  // ── Tests ────────────────────────────────────
  loadTests() {
    this.isLoading = true;
    this.labService.getAllTests().subscribe({
      next: (data) => { this.tests = data; this.isLoading = false; },
      error: () => {
        this.labService.getPendingTests().subscribe({
          next: (data) => { this.tests = data; this.isLoading = false; },
          error: () => { this.error = 'Failed to load tests'; this.isLoading = false; }
        });
      }
    });
  }

  // ── Notifications ────────────────────────────
  loadNotifications() {
    if (!this.currentUserId) return;
    this.notifService.getAllNotifications(this.currentUserId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.read).length;
      },
      error: () => {
        // Non-critical — silently ignore
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  openNotifications() {
    this.selectedTest = null;
    this.showNotifPanel = true;
    this.loadNotifications(); // refresh from backend every time panel opens
  }

  closeNotifPanel() { this.showNotifPanel = false; }

  // Mark single notification read via backend
  markNotifRead(n: NotificationResponse) {
    if (n.read) return;
    this.notifService.markAsRead(n.id).subscribe({
      next: (updated) => {
        n.read = updated.read;
        this.unreadCount = this.notifications.filter(x => !x.read).length;
      },
      error: () => {
        // Optimistic update even on failure
        n.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  // Mark all read via backend
  markAllRead() {
    if (!this.currentUserId) return;
    this.notifService.markAllAsRead(this.currentUserId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      },
      error: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    });
  }

  recalcUnread() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  // ── Navigation ──────────────────────────────
  onSearch(query: string) {
    this.searchQuery = query;
    if (query.trim()) { this.currentView = 'queue'; this.activeFilter = 'all'; }
  }

  setView(view: string) {
    this.currentView = view as 'dashboard' | 'queue';
  }

  goToFilter(status: string) {
    this.currentView = 'queue';
    this.activeFilter = status;
  }

  // ── Modal ────────────────────────────────────
  openPatientModal(test: any) {
    this.showNotifPanel = false;
    this.selectedTest = test;
    this.showResultForm = false;
    this.resultForm = {
      resultValue: '',
      unit: '',
      referenceRange: '',
      recordedBy: this.currentUser,
      notes: '',
      isAbnormal: false
    };
  }

  closeModal() {
    this.selectedTest = null;
    this.showResultForm = false;
  }

  // ── Filters ─────────────────────────────────
  filteredTests() {
    let list = this.activeFilter === 'all'
      ? [...this.tests]
      : this.tests.filter(t => t.status === this.activeFilter);
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(t =>
        t.testName?.toLowerCase().includes(q) ||
        t.patientId?.toString().includes(q)
      );
    }
    return list;
  }

  dashboardTests() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.tests.slice(0, 6);
    return this.tests.filter(t =>
      t.testName?.toLowerCase().includes(q) ||
      t.patientId?.toString().includes(q) ||
      t.id?.toString().includes(q)
    ).slice(0, 6);
  }

  getByStatus(s: string) { return this.tests.filter(t => t.status === s); }
  pendingCount() { return this.getByStatus('PENDING').length; }

  // ── Actions ─────────────────────────────────
  collectSample(test: any) {
    this.labService.collectSample(test.id).subscribe({
      next: (updated) => {
        test.status = updated?.status ?? 'SAMPLE_COLLECTED';
        this.loadNotifications(); // backend may have created a notification
      },
      error: () => { test.status = 'SAMPLE_COLLECTED'; }
    });
  }

  startTest(test: any) {
    const username = this.authService.getUsername() || 'Unknown Tech';
    this.labService.startTest(test.id, username).subscribe({
      next: (updated) => {
        test.status = updated?.status ?? 'IN_PROGRESS';
        test.assignedTo = updated?.assignedTo ?? username;
        this.loadNotifications();
      },
      error: () => { test.status = 'IN_PROGRESS'; test.assignedTo = username; }
    });
  }

  uploadResult(test: any) {
    if (!this.resultForm.resultValue.trim()) { alert('Result value is required'); return; }
    const payload = {
      resultValue: this.resultForm.resultValue,
      unit: this.resultForm.unit || null,
      referenceRange: this.resultForm.referenceRange || null,
      recordedBy: this.resultForm.recordedBy || this.currentUser,
      notes: this.resultForm.notes || null,
      isAbnormal: this.resultForm.isAbnormal
    };
    this.labService.uploadResult(test.id, payload).subscribe({
      next: () => {
        test.status = 'COMPLETED';
        Object.assign(test, payload);
        this.showResultForm = false;
        // Backend sends a notification on upload — reload after short delay
        setTimeout(() => this.loadNotifications(), 800);
      }
    });
  }

  // ── Charts ───────────────────────────────────
  getDonutDash(status: string): string {
    if (!this.tests.length) return `0 ${this.CIRCUMFERENCE}`;
    const pct = this.getByStatus(status).length / this.tests.length;
    return `${pct * this.CIRCUMFERENCE} ${this.CIRCUMFERENCE - pct * this.CIRCUMFERENCE}`;
  }

  getDonutOffset(status: string): string {
    const idx = this.STATUS_ORDER.indexOf(status);
    let offset = 0;
    for (let i = 0; i < idx; i++) {
      const pct = this.tests.length
        ? this.getByStatus(this.STATUS_ORDER[i]).length / this.tests.length
        : 0;
      offset += pct * this.CIRCUMFERENCE;
    }
    return String(-offset);
  }

  testTypeCounts(): { name: string; count: number }[] {
    const map: Record<string, number> = {};
    this.tests.forEach(t => { map[t.testName] = (map[t.testName] || 0) + 1; });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  barWidth(count: number): number {
    const max = Math.max(...this.testTypeCounts().map(t => t.count), 1);
    return (count / max) * 100;
  }

  // ── Status helpers ───────────────────────────
  isStepDone(step: string): boolean {
    if (!this.selectedTest) return false;
    return this.STATUS_ORDER.indexOf(this.selectedTest.status) > this.STATUS_ORDER.indexOf(step);
  }

  formatStatus(s: string): string {
    return s?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) ?? '';
  }

  userInitials(): string {
    return this.currentUser.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  logout() { this.authService.logout(); }
  getStatusClass(s: string) { return 'badge-' + s; }
}
