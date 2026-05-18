import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LabService } from '../../core/services/lab.service';
import { AuthService } from '../../core/services/auth.service';
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

  // Navigation
  currentView: 'dashboard' | 'queue' | 'settings' = 'dashboard';
  activeFilter: string = 'all';

  // Drawer (patient detail panel)
  selectedTest: any = null;
  showResultForm = false;
  resultValue = '';
  remarks = '';

  // Notifications
  showNotifPanel = false;
  unreadCount = 0;
  notifications: { id: number; title: string; message: string; type: string; read: boolean; time: Date }[] = [];

  // User
  currentUser = '';
  today = new Date();

  constructor(
    private labService: LabService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUsername() || 'Lab Tech';
    this.loadTests();
  }

  loadTests() {
    this.isLoading = true;
    this.labService.getPendingTests().subscribe({
      next: (data) => { this.tests = data; this.isLoading = false; },
      error: () => { this.error = 'Failed to load tests'; this.isLoading = false; }
    });
  }

  // ── Search ──────────────────────────────────
  // Called on every keystroke. Auto-switches to queue view so results are visible.
  onSearch(query: string) {
    this.searchQuery = query;
    if (query.trim()) {
      this.currentView = 'queue';
      this.activeFilter = 'all';
    }
  }

  // ── Navigation ──────────────────────────────
  openNotifications() {
    this.showNotifPanel = true;
  }

  // ── Drawer ──────────────────────────────────
  openPatient(test: any) {
    this.selectedTest = test;
    this.showResultForm = false;
    this.resultValue = '';
    this.remarks = '';
  }

  closeDrawer() {
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
        t.patientId?.toString().includes(q) ||
        t.id?.toString().includes(q) ||
        t.testCode?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // Dashboard recent activity — also respects search query
  dashboardTests() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.tests.slice(0, 5);
    return this.tests.filter(t =>
      t.testName?.toLowerCase().includes(q) ||
      t.patientId?.toString().includes(q) ||
      t.id?.toString().includes(q) ||
      t.testCode?.toLowerCase().includes(q)
    ).slice(0, 5);
  }

  getByStatus(status: string) {
    return this.tests.filter(t => t.status === status);
  }

  pendingCount() {
    return this.getByStatus('PENDING').length;
  }

  // ── Actions ─────────────────────────────────
  collectSample(test: any) {
    this.labService.collectSample(test.id).subscribe(() => {
      test.status = 'SAMPLE_COLLECTED';
      this.pushNotif('Sample Collected', `Sample collected for Patient #${test.patientId} — ${test.testName}`, 'info');
    });
  }

  startTest(test: any) {
    const username = this.authService.getUsername() || 'Unknown Tech';
    this.labService.startTest(test.id, username).subscribe(() => {
      test.status = 'IN_PROGRESS';
      test.assignedTo = username;
      this.pushNotif('Test Started', `${test.testName} is now in progress (Patient #${test.patientId})`, 'info');
    });
  }

  uploadResult(test: any) {
    if (!this.resultValue.trim()) { alert('Please enter a result value'); return; }
    this.labService.uploadResult(test.id, { resultValue: this.resultValue, remarks: this.remarks }).subscribe({
      next: () => {
        test.status = 'COMPLETED';
        test.resultValue = this.resultValue;
        test.remarks = this.remarks;
        this.pushNotif('Result Uploaded', `${test.testName} completed for Patient #${test.patientId}`, 'success');
        this.showResultForm = false;
        this.resultValue = '';
        this.remarks = '';
      }
    });
  }

  // ── Notifications ────────────────────────────
  pushNotif(title: string, message: string, type: string) {
    this.notifications.unshift({ id: Date.now(), title, message, type, read: false, time: new Date() });
    this.unreadCount++;
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
  }

  recalcUnread() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  // ── Status helpers ───────────────────────────
  statusOrder = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'];

  isStepDone(step: string): boolean {
    if (!this.selectedTest) return false;
    const currentIdx = this.statusOrder.indexOf(this.selectedTest.status);
    const stepIdx = this.statusOrder.indexOf(step);
    return currentIdx > stepIdx;
  }

  formatStatus(s: string): string {
    return s?.replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase()) ?? '';
  }

  completionRate(): number {
    if (!this.tests.length) return 0;
    return Math.round((this.getByStatus('COMPLETED').length / this.tests.length) * 100);
  }

  userInitials(): string {
    return this.currentUser.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  setView(view: string) {
    this.currentView = view as 'dashboard' | 'queue';
  }

  // ── Auth ─────────────────────────────────────
  logout() {
    this.authService.logout();
  }

  getStatusClass(status: string) { return 'badge-' + status; }
}
