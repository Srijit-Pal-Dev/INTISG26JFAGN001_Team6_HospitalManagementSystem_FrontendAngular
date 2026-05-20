import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, CheckCircle, Clock, XCircle, FileText, Calendar, User, AlertCircle } from 'lucide-angular';
import { PatientService } from '../../../../../core/services/patient.service';
import { AppointmentDTO, AppointmentStatus } from '../../../../../core/models/index';

@Component({
    selector: 'app-doctor-appointments',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './doctor-appointments.component.html',
    styleUrl: './doctor-appointments.component.css'
})
export class DoctorAppointmentsComponent implements OnInit {
    readonly CheckIcon = CheckCircle;
    readonly ClockIcon = Clock;
    readonly XCircleIcon = XCircle;
    readonly PrescriptionIcon = FileText;
    readonly CalendarIcon = Calendar;
    readonly UserIcon = User;
    readonly AlertIcon = AlertCircle;

    doctorId = signal<number>(0);
    appointments = signal<AppointmentDTO[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');
    completingId = signal<number | null>(null);
    filterStatus = signal<string>('ALL');

    AppointmentStatus = AppointmentStatus;

    filteredAppointments = computed(() => {
        const status = this.filterStatus();
        if (status === 'ALL') return this.sortedAppointments();
        return this.sortedAppointments().filter(a => a.status === status);
    });

    sortedAppointments = computed(() =>
        [...this.appointments()].sort((a, b) => {
            const dateCompare = b.appointmentDate.localeCompare(a.appointmentDate);
            if (dateCompare !== 0) return dateCompare;
            return b.appointmentTime.localeCompare(a.appointmentTime);
        })
    );

    private patientService = inject(PatientService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit(): void {
        this.route.parent?.params.subscribe(params => {
            const id = Number(params['doctorId']);
            if (!isNaN(id) && id > 0) {
                this.doctorId.set(id);
                this.loadAppointments();
            }
        });
    }

    // loadAppointments(): void {
    //     this.isLoading.set(true);
    //     this.errorMessage.set('');
    //     this.patientService.getAppointmentsByDoctor(this.doctorId()).subscribe({
    //         next: (list) => {
    //             this.appointments.set(list);
    //             this.isLoading.set(false);
    //         },
    //         error: (err) => {
    //             this.errorMessage.set(err?.error?.message || 'Failed to load appointments');
    //             this.isLoading.set(false);
    //         }
    //     });
    // }
    loadAppointments(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.patientService.getAppointmentsByDoctor(this.doctorId()).subscribe({
            next: (list) => {
                this.appointments.set(Array.isArray(list) ? list : []);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.appointments.set([]);
                this.errorMessage.set(err?.error?.message || 'Failed to load appointments');
                this.isLoading.set(false);
            }
        });
    }

    markComplete(appointment: AppointmentDTO): void {
        this.completingId.set(appointment.id);
        this.patientService.completeAppointment(appointment.id).subscribe({
            next: (updated) => {
                this.appointments.update(list =>
                    list.map(a => a.id === updated.id ? updated : a)
                );
                this.completingId.set(null);
            },
            error: (err) => {
                this.completingId.set(null);
                alert(err?.error?.message || 'Failed to complete appointment');
            }
        });
    }

    createPrescription(appointment: AppointmentDTO): void {
        this.router.navigate([
            '/doctor-dashboard',
            this.doctorId(),
            'prescription',
            appointment.id
        ]);
    }

    formatDateForDisplay(dateStr: string): string {
        const [dd, mm, yyyy] = dateStr.split('-');
        const d = new Date(+yyyy, +mm - 1, +dd);
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    }

    formatTimeForDisplay(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${display}:${m} ${period}`;
    }

    getStatusClass(status: AppointmentStatus): string {
        const map: Record<string, string> = {
            SCHEDULED: 'da-status--scheduled',
            COMPLETED: 'da-status--completed',
            CANCELLED: 'da-status--cancelled',
            NO_SHOW: 'da-status--noshow'
        };
        return map[status] ?? '';
    }

    setFilter(status: string): void {
        this.filterStatus.set(status);
    }

    //     countByStatus(status: string): number {
    //         if (status === 'ALL') return this.appointments().length;
    //         return this.appointments().filter(a => a.status === status).length;
    //     }
    countByStatus(status: string): number {
        if (status === 'ALL') return this.appointments().length;
        return this.appointments().filter(a => a.status === status).length;
    }

}
