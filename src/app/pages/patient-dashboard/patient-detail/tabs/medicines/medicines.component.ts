import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Pill, Calendar, Search, FileText, ChevronDown, ChevronUp, IndianRupee } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PatientService } from '../../../../../core/services/patient.service';
import { MedicineService } from '../../../../../core/services/medicine.service';
import { DoctorService } from '../../../../../core/services/doctor.service';
import {
    AppointmentDTO,
    AppointmentStatus,
    DispenseRequestResponse,
    DoctorDTO
} from '../../../../../core/models/index';

interface AppointmentWithMedicines {
    appointment: AppointmentDTO;
    doctor?: DoctorDTO;
    medicines: DispenseRequestResponse[];
    expanded: boolean;
}

@Component({
    selector: 'app-medicines',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './medicines.component.html'
})
export class MedicinesComponent implements OnInit {
    readonly PillIcon = Pill;
    readonly CalendarIcon = Calendar;
    readonly SearchIcon = Search;
    readonly FileIcon = FileText;
    readonly ChevronDownIcon = ChevronDown;
    readonly ChevronUpIcon = ChevronUp;
    readonly RupeeIcon = IndianRupee;

    patientId = signal<number | null>(null);

    groupedMedicines = signal<AppointmentWithMedicines[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');
    searchQuery = signal('');

    filteredGroups = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const groups = this.groupedMedicines();
        if (!q) return groups;

        return groups.filter(g =>
            g.medicines.some(m => m.medicineName.toLowerCase().includes(q)) ||
            g.doctor?.fullName.toLowerCase().includes(q) ||
            g.doctor?.specialty.toLowerCase().includes(q)
        );
    });

    totalMedicineCount = computed(() =>
        this.groupedMedicines().reduce((sum, g) => sum + g.medicines.length, 0)
    );

    private patientService = inject(PatientService);
    private medicineService = inject(MedicineService);
    private doctorService = inject(DoctorService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit() {
        this.route.parent?.params.subscribe(params => {
            const id = Number(params['patientId']);
            if (!isNaN(id)) {
                this.patientId.set(id);
                this.loadMedicines(id);
            }
        });
    }

    loadMedicines(patientId: number) {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.patientService.getAppointmentsByPatient(patientId).subscribe({
            next: (appointments) => {
                const completed = appointments.filter(a => a.status === AppointmentStatus.COMPLETED);

                if (completed.length === 0) {
                    this.groupedMedicines.set([]);
                    this.isLoading.set(false);
                    return;
                }

                const uniqueDoctorIds = [...new Set(completed.map(a => a.doctorId))];
                const doctorRequests = uniqueDoctorIds.map(id =>
                    this.doctorService.getDoctorById(id).pipe(catchError(() => of(null)))
                );

                const medicineRequests = completed.map(a =>
                    this.medicineService.getMedicinesByAppointment(a.id).pipe(catchError(() => of([])))
                );

                forkJoin([forkJoin(doctorRequests), forkJoin(medicineRequests)]).subscribe({
                    next: ([doctors, medicineLists]) => {
                        const doctorMap = new Map<number, DoctorDTO>();
                        doctors.forEach(d => { if (d) doctorMap.set(d.id, d); });

                        const groups: AppointmentWithMedicines[] = completed
                            .map((appt, idx) => ({
                                appointment: appt,
                                doctor: doctorMap.get(appt.doctorId),
                                medicines: medicineLists[idx] || [],
                                expanded: false
                            }))
                            .filter(g => g.medicines.length > 0)
                            .sort((a, b) => this.parseDate(b.appointment.appointmentDate).getTime() -
                                this.parseDate(a.appointment.appointmentDate).getTime());

                        this.groupedMedicines.set(groups);
                        this.isLoading.set(false);
                    },
                    error: () => {
                        this.errorMessage.set('Failed to load medicine details');
                        this.isLoading.set(false);
                    }
                });
            },
            error: (err) => {
                if (err?.status === 404) {
                    this.groupedMedicines.set([]);
                } else {
                    this.errorMessage.set(
                        err?.error?.message || `Error ${err?.status}: ${err?.statusText || 'Failed to load medicines'}`
                    );
                }
                this.isLoading.set(false);
            }
        });
    }

    parseDate(dateStr: string): Date {
        const [dd, mm, yyyy] = dateStr.split('-').map(Number);
        return new Date(yyyy, mm - 1, dd);
    }

    formatDate(dateStr: string): string {
        const [dd, mm, yyyy] = dateStr.split('-').map(Number);
        return new Date(yyyy, mm - 1, dd).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    toggleExpanded(appointmentId: number) {
        this.groupedMedicines.update(list =>
            list.map(g =>
                g.appointment.id === appointmentId ? { ...g, expanded: !g.expanded } : g
            )
        );
    }

    groupTotal(group: AppointmentWithMedicines): number {
        return group.medicines.reduce((sum, m) => sum + (m.totalPrice || 0), 0);
    }

    goToBook() {
        const id = this.patientId();
        if (id) this.router.navigate(['/patient-dashboard', id, 'book']);
    }
}