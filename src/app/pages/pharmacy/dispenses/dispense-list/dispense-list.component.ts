import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DispenseService } from '../../../../core/services/dispense.service';
import { DispenseStateService } from '../../../../core/services/dispense-state.service';
import { DispenseGroup } from '../../../../core/models/dispense.model';
import { DispenseRequestResponse } from '../../../../core/models/medicine.model';

@Component({
  selector: 'app-dispense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dispense-list.component.html',
  styleUrls: ['./dispense-list.component.css']
})
export class DispenseListComponent implements OnInit {
  private dispenseService = inject(DispenseService);
  private stateService    = inject(DispenseStateService);
  private router          = inject(Router);

  dispensedIds = new Set<number>();
  groups: DispenseGroup[] = [];
  loading = false;
  error = '';
  dispensingId: number | null = null;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = '';
    this.dispenseService.getPendingGrouped().subscribe({
      next: data => { this.groups = data; this.loading = false; },
      error: () => { this.error = 'Failed to load pending dispenses.'; this.loading = false; }
    });
  }

  goToEdit(group: DispenseGroup): void {
    this.stateService.setGroup(group);
    this.router.navigate(['/pharmacy-dashboard/dispenses/edit', group.prescriptionId]);
  }

  dispenseGroup(group: DispenseGroup): void {
    if (group.items.length === 0) return;
    this.dispensingId = group.prescriptionId;

    const ids = group.items.map(i => i.id);
    let completed = 0;
    let failed = false;

    for (const id of ids) {
      this.dispenseService.dispense(id).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length && !failed) {
            this.dispensingId = null;
            this.dispensedIds.add(group.prescriptionId);
            setTimeout(() => {
              this.groups = this.groups.filter(g => g.prescriptionId !== group.prescriptionId);
              this.dispensedIds.delete(group.prescriptionId);
            }, 1500);
          }
        },
        error: err => {
          if (!failed) {
            failed = true;
            this.dispensingId = null;
            const msg = err?.error?.message ?? '';
            if (msg.toLowerCase().includes('invoice') || msg.toLowerCase().includes('billing')) {
              this.error = 'Billing invoice not found. Ask the receptionist to create the invoice first.';
            } else if (msg.toLowerCase().includes('stock')) {
              this.error = `Insufficient stock: ${msg}`;
            } else {
              this.error = msg || 'Failed to dispense. Please try again.';
            }
          }
        }
      });
    }
  }

  getMedicineNamesSummary(group: DispenseGroup): string {
    const names = group.items.map(i => i.medicineName).filter(Boolean);
    return names.length <= 3 ? names.join(', ') : names.slice(0, 3).join(', ') + ', ...';
  }

  getMedIcon(item: DispenseRequestResponse): string {
    const n = (item.medicineName ?? '').toLowerCase();
    if (n.includes('syrup'))
      return 'https://cdn-icons-png.flaticon.com/256/10306/10306262.png';
    if (n.includes('insulin') || n.includes('inject'))
      return 'https://cdn.iconscout.com/icon/free/png-512/medical-injection-drug-medicine-syringe-care-treatment-6-29863.png';
    if (n.includes('paracetamol') || n.includes('amoxicillin') || n.includes('metformin') || n.includes('cetirizine'))
      return 'https://tse1.mm.bing.net/th/id/OIP.I7873gN48HfRVx1udgVDmAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3';
    return 'https://tse1.mm.bing.net/th/id/OIP.MJ_5n82vzXg9ABwWPckAagHaEk?r=0&rs=1&pid=ImgDetMain&o=7&rm=3';
  }

  trackByPrescription(_: number, g: DispenseGroup): number { return g.prescriptionId; }

  goToAppointmentLookup(): void {
    this.router.navigate(['/pharmacy-dashboard/dispenses/appointment']);
  }
}
