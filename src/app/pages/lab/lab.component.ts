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

  currentView: 'dashboard' | 'queue' = 'dashboard';
  activeFilter = 'all';

  // Modal (replaces drawer)
  selectedTest: any = null;
  showResultForm = false;

  // Full result form — maps to every DB column
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
  notifications: { id: number; title: string; message: string; type: string; read: boolean; time: Date }[] = [];

  currentUser = '';
  today = new Date();

  // Donut chart circumference for r=48
  private readonly CIRCUMFERENCE = 2 * Math.PI * 48; // ≈ 301.6

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

  openNotifications() {
    this.selectedTest = null;
    this.showNotifPanel = true;
  }

  closeNotifPanel() { this.showNotifPanel = false; }

  // ── Modal ────────────────────────────────────
  openPatientModal(test: any) {
    this.showNotifPanel = false;
    this.selectedTest = test;
    this.showResultForm = false;
    this.resultForm = {
      resultValue: '',
      unit: '',
      referenceRange: '',
      recordedBy: this.currentUser,   // pre-fill with logged-in user
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
        t.patientId?.toString().includes(q) ||
        t.id?.toString().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q)
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
        this.pushNotif('Sample Collected', `Sample for Patient #${test.patientId} — ${test.testName}`, 'info');
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
        this.pushNotif('Test Started', `${test.testName} assigned to ${test.assignedTo}`, 'info');
      },
      error: () => { test.status = 'IN_PROGRESS'; test.assignedTo = username; }
    });
  }

  uploadResult(test: any) {
    if (!this.resultForm.resultValue.trim()) {
      alert('Result value is required');
      return;
    }
    // Send ALL fields so nothing is null in the DB
    const payload = {
      resultValue:    this.resultForm.resultValue,
      unit:           this.resultForm.unit || null,
      referenceRange: this.resultForm.referenceRange || null,
      recordedBy:     this.resultForm.recordedBy || this.currentUser,
      notes:          this.resultForm.notes || null,
      isAbnormal:     this.resultForm.isAbnormal
    };

    this.labService.uploadResult(test.id, payload).subscribe({
      next: () => {
        test.status = 'COMPLETED';
        // Store result fields on the test object so they display in modal
        Object.assign(test, payload);
        const label = this.resultForm.isAbnormal ? '⚠ Abnormal result' : 'Result uploaded';
        this.pushNotif(label, `${test.testName} — Patient #${test.patientId}`, this.resultForm.isAbnormal ? 'warning' : 'success');
        this.showResultForm = false;
      }
    });
  }

  // ── Charts ───────────────────────────────────
  private statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    SAMPLE_COLLECTED: '#2563c8',
    IN_PROGRESS: '#8b5cf6',
    COMPLETED: '#10b981'
  };

  private statusOrder = ['PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'];

  // Returns stroke-dasharray for a donut segment
  getDonutDash(status: string): string {
    if (!this.tests.length) return `0 ${this.CIRCUMFERENCE}`;
    const pct = this.getByStatus(status).length / this.tests.length;
    const seg = pct * this.CIRCUMFERENCE;
    return `${seg} ${this.CIRCUMFERENCE - seg}`;
  }

  // Returns stroke-dashoffset so segments stack around the circle
  getDonutOffset(status: string): string {
    const idx = this.statusOrder.indexOf(status);
    let offset = 0;
    for (let i = 0; i < idx; i++) {
      const pct = this.tests.length ? this.getByStatus(this.statusOrder[i]).length / this.tests.length : 0;
      offset += pct * this.CIRCUMFERENCE;
    }
    return String(-offset);
  }

  // Top 5 test types by count
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

  // ── Status pipeline helpers ──────────────────
  isStepDone(step: string): boolean {
    if (!this.selectedTest) return false;
    return this.statusOrder.indexOf(this.selectedTest.status) > this.statusOrder.indexOf(step);
  }

  formatStatus(s: string): string {
    return s?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) ?? '';
  }

  // ── Notifications ────────────────────────────
  pushNotif(title: string, message: string, type: string) {
    this.notifications.unshift({ id: Date.now(), title, message, type, read: false, time: new Date() });
    this.unreadCount++;
  }

  markAllRead() { this.notifications.forEach(n => n.read = true); this.unreadCount = 0; }
  recalcUnread() { this.unreadCount = this.notifications.filter(n => !n.read).length; }

  // ── Misc ────────────────────────────────────
  userInitials(): string {
    return this.currentUser.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  logout() { this.authService.logout(); }
  getStatusClass(s: string) { return 'badge-' + s; }
}
