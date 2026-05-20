import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediclaimService } from '../../../core/services/mediclaim.service';
import { MediclaimDTO, MediclaimStatus } from '../../../core/models/index';

@Component({
  selector: 'app-mediclaim',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mediclaim.component.html',
  styleUrls: ['../adminDashboard.shared.css', './mediclaim.component.css']  
})
export class MediclaimComponent implements OnInit {

  mediclaims       = signal<MediclaimDTO[]>([]);
  filteredMediclaims = signal<MediclaimDTO[]>([]);
  isLoading        = false;
  activeFilter: MediclaimStatus | 'all' = 'all';

  selectedClaim: MediclaimDTO | null = null;
  showDetailModal  = false;
  isSubmitting     = false;
  toastMessage     = '';
  toastType: 'ok' | 'err' | 'info' = 'info';
  showToast        = false;

  constructor(private mediclaimService: MediclaimService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;
    this.mediclaimService.getAllMediclaims().subscribe({
      next: (data) => {
        this.mediclaims.set(data);
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast('Failed to load mediclaims', 'err');
      }
    });
  }

  applyFilter() {
    if (this.activeFilter === 'all') {
      this.filteredMediclaims.set(this.mediclaims());
    } else {
      this.filteredMediclaims.set(
        this.mediclaims().filter(m => m.status === this.activeFilter)
      );
    }
  }

  setFilter(filter: MediclaimStatus | 'all') {
    this.activeFilter = filter;
    this.applyFilter();
  }

  countByStatus(status: MediclaimStatus): number {
    return this.mediclaims().filter(m => m.status === status).length;
  }

  viewClaim(claim: MediclaimDTO) {
    this.selectedClaim  = claim;
    this.showDetailModal = true;
  }

  approve() {
    const claim = this.selectedClaim;
    if (!claim || !claim.id) return;
    this.isSubmitting = true;
    this.mediclaimService.updateMediclaimStatus(claim.id, 'APPROVED').subscribe({
        next: (updated) => {
        this.isSubmitting    = false;
        this.showDetailModal = false;
        this.updateClaimInList(updated);
        this.toast(`Claim #${updated.id} approved`, 'ok');
        },
        error: (err) => {
        this.isSubmitting = false;
        this.toast(err?.error?.message || 'Failed to approve claim', 'err');
        }
    });
    }

    reject() {
    const claim = this.selectedClaim;
    if (!claim || !claim.id) return;
    this.isSubmitting = true;
    this.mediclaimService.updateMediclaimStatus(claim.id, 'REJECTED').subscribe({
        next: (updated) => {
        this.isSubmitting    = false;
        this.showDetailModal = false;
        this.updateClaimInList(updated);
        this.toast(`Claim #${updated.id} rejected`, 'err');
        },
        error: (err) => {
        this.isSubmitting = false;
        this.toast(err?.error?.message || 'Failed to reject claim', 'err');
        }
    });
    }

  private updateClaimInList(updated: MediclaimDTO) {
    this.mediclaims.set(
      this.mediclaims().map(m => m.id === updated.id ? updated : m)
    );
    this.applyFilter();
  }

  getStatusBadgeClass(status: MediclaimStatus | undefined): string {
    if (!status) return '';
    const map: Record<string, string> = {
      PENDING:  'badge-pending',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected'
    };
    return map[status] ?? '';
  }

  // formatDate(instant: string): string {
  //   if (!instant) return '—';
  //   return new Date(instant).toLocaleDateString('en-US', {
  //     year: 'numeric', month: 'short', day: 'numeric'
  //   });
  // }
  formatDate(instant: string | undefined): string {
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
}