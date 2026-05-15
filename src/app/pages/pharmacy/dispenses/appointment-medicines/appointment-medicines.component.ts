import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicineService, PharmacyDTO } from '../../../../core/services/medicine.service';

@Component({
  selector: 'app-appointment-medicines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-medicines.component.html',
  styleUrls: ['./appointment-medicines.component.css']
})
export class AppointmentMedicinesComponent {
  private medicineService = inject(MedicineService);
  private router          = inject(Router);

  appointmentId: number | null = null;
  lastSearchedId: number | null = null;
  medicines: PharmacyDTO[] = [];
  loading = false;
  error = '';
  searched = false;

  get grandTotal(): number {
    return this.medicines.reduce((sum, m) => sum + Number(m.totalPrice ?? 0), 0);
  }

  lookup(): void {
    if (!this.appointmentId) return;
    this.loading = true; this.error = ''; this.searched = false; this.medicines = [];

    this.medicineService.getMedicinesByAppointmentId(this.appointmentId).subscribe({
      next: data => {
        this.medicines = data;
        this.lastSearchedId = this.appointmentId;
        this.loading = false;
        this.searched = true;
      },
      error: () => {
        this.error = 'Failed to fetch medicines for this appointment.';
        this.loading = false;
        this.searched = true;
      }
    });
  }

  back(): void { this.router.navigate(['/pharmacy-dashboard/dispenses']); }
}
