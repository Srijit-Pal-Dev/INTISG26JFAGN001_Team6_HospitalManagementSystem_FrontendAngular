import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
    LucideAngularModule, Calendar, Clock, FileText, Check, AlertCircle,
    ChevronDown, ChevronUp, CalendarPlus, Stethoscope, Pill, FlaskConical
} from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PatientService } from '../../../../../core/services/patient.service';
import { DoctorService } from '../../../../../core/services/doctor.service';
import { MedicineService } from '../../../../../core/services/medicine.service';
import { LabResultService } from '../../../../../core/services/lab-result.service';
import {
    AppointmentDTO, AppointmentStatus, DoctorDTO,
    DispenseRequestResponse, LabResultResponse
} from '../../../../../core/models/index';

interface AppointmentWithDoctor extends AppointmentDTO {
    doctor?: DoctorDTO;
    expanded?: boolean;
    medicinesLoaded?: boolean;
    medicines?: DispenseRequestResponse[];
    labLoaded?: boolean;
    labResults?: LabResultResponse[];
}

@Component({
    selector: 'app-my-appointments',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './my-appointments.component.html'
})
export class MyAppointmentsComponent implements OnInit {
    readonly CalendarIcon = Calendar;
    readonly ClockIcon = Clock;
    readonly ReasonIcon = FileText;
    readonly CheckIcon = Check;
    readonly AlertIcon = AlertCircle;
    readonly ChevronDownIcon = ChevronDown;
    readonly ChevronUpIcon = ChevronUp;
    readonly CalendarPlusIcon = CalendarPlus;
    readonly DoctorIcon = Stethoscope;
    readonly PillIcon = Pill;
    readonly FlaskIcon = FlaskConical;

    readonly Status = AppointmentStatus;

    patientId = signal<number | null>(null);

    appointments = signal<AppointmentWithDoctor[]>([]);
    allLabResults = signal<LabResultResponse[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');

    cancellingId = signal<number | null>(null);
    showCancelConfirm = signal<number | null>(null);

    upcomingAppointments = computed(() =>
        this.appointments()
            .filter(a => a.status === AppointmentStatus.SCHEDULED)
            .sort((a, b) => this.parseDate(a.appointmentDate, a.appointmentTime).getTime() -
                this.parseDate(b.appointmentDate, b.appointmentTime).getTime())
    );

    pastAppointments = computed(() =>
        this.appointments()
            .filter(a => a.status !== AppointmentStatus.SCHEDULED)
            .sort((a, b) => this.parseDate(b.appointmentDate, b.appointmentTime).getTime() -
                this.parseDate(a.appointmentDate, a.appointmentTime).getTime())
    );

    private patientService = inject(PatientService);
    private doctorService = inject(DoctorService);
    private medicineService = inject(MedicineService);
    private labService = inject(LabResultService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit() {
        this.route.parent?.params.subscribe(params => {
            const id = Number(params['patientId']);
            if (!isNaN(id)) {
                this.patientId.set(id);
                this.loadAppointments(id);
                this.loadAllLabResults(id);
            }
        });
    }

    loadAppointments(patientId: number) {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.patientService.getAppointmentsByPatient(patientId).subscribe({
            next: (list) => {
                if (!list || list.length === 0) {
                    this.appointments.set([]);
                    this.isLoading.set(false);
                    return;
                }

                const uniqueDoctorIds = [...new Set(list.map(a => a.doctorId))];
                const doctorRequests = uniqueDoctorIds.map(id =>
                    this.doctorService.getDoctorById(id).pipe(catchError(() => of(null)))
                );

                forkJoin(doctorRequests).subscribe({
                    next: (doctors) => {
                        const doctorMap = new Map<number, DoctorDTO>();
                        doctors.forEach(d => { if (d) doctorMap.set(d.id, d); });

                        const enriched: AppointmentWithDoctor[] = list.map(a => ({
                            ...a,
                            doctor: doctorMap.get(a.doctorId),
                            expanded: false,
                            medicinesLoaded: false,
                            medicines: [],
                            labLoaded: false,
                            labResults: []
                        }));

                        this.appointments.set(enriched);
                        this.isLoading.set(false);
                    },
                    error: () => {
                        this.appointments.set(list.map(a => ({ ...a, expanded: false })));
                        this.isLoading.set(false);
                    }
                });
            },
            error: (err) => {
                if (err?.status === 404) {
                    this.appointments.set([]);
                } else {
                    this.errorMessage.set(
                        err?.error?.message || `Error ${err?.status}: ${err?.statusText || 'Failed to load appointments'}`
                    );
                }
                this.isLoading.set(false);
            }
        });
    }

    loadAllLabResults(patientId: number) {
        this.labService.getResultsByPatient(patientId).subscribe({
            next: (list) => this.allLabResults.set(list),
            error: () => this.allLabResults.set([])
        });
    }

    parseDate(dateStr: string, timeStr: string): Date {
        const [dd, mm, yyyy] = dateStr.split('-').map(Number);
        const [hh, min] = timeStr.split(':').map(Number);
        return new Date(yyyy, mm - 1, dd, hh, min);
    }

    formatDate(dateStr: string): string {
        const [dd, mm, yyyy] = dateStr.split('-').map(Number);
        return new Date(yyyy, mm - 1, dd).toLocaleDateString('en-GB', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    formatTime(timeStr: string): string {
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${display}:${m} ${period}`;
    }

    getStatusStyle(status: AppointmentStatus): { bg: string; text: string; label: string } {
        switch (status) {
            case AppointmentStatus.COMPLETED: return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
            case AppointmentStatus.CANCELLED: return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' };
            case AppointmentStatus.NO_SHOW: return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'No Show' };
            default: return { bg: 'bg-blue-100', text: 'text-[#1a7fd4]', label: 'Scheduled' };
        }
    }

    toggleExpanded(appt: AppointmentWithDoctor) {
        const willExpand = !appt.expanded;

        this.appointments.update(list =>
            list.map(a => a.id === appt.id ? { ...a, expanded: willExpand } : a)
        );

        if (willExpand && !appt.medicinesLoaded) {
            this.loadMedicinesForAppointment(appt.id);
        }
        if (willExpand && !appt.labLoaded) {
            this.assignLabResultsToAppointment(appt);
        }
    }

    loadMedicinesForAppointment(appointmentId: number) {
        this.medicineService.getMedicinesByAppointment(appointmentId).subscribe({
            next: (meds) => {
                this.appointments.update(list =>
                    list.map(a => a.id === appointmentId
                        ? { ...a, medicines: meds, medicinesLoaded: true }
                        : a)
                );
            },
            error: () => {
                this.appointments.update(list =>
                    list.map(a => a.id === appointmentId
                        ? { ...a, medicines: [], medicinesLoaded: true }
                        : a)
                );
            }
        });
    }

    // assignLabResultsToAppointment(appt: AppointmentWithDoctor) {
    //     const apptDate = this.parseDate(appt.appointmentDate, appt.appointmentTime);
    //     const dayStart = new Date(apptDate); dayStart.setHours(0, 0, 0, 0);
    //     const dayEnd = new Date(apptDate); dayEnd.setHours(23, 59, 59, 999);

    //     const matched = this.allLabResults().filter(r => {
    //         const recorded = new Date(r.recordedAt);
    //         return recorded >= dayStart && recorded <= dayEnd;
    //     });

    //     this.appointments.update(list =>
    //         list.map(a => a.id === appt.id
    //             ? { ...a, labResults: matched, labLoaded: true }
    //             : a)
    //     );
    // }
    assignLabResultsToAppointment(appt: AppointmentWithDoctor) {
        this.labService.getTestsByAppointment(appt.id).subscribe({
            next: (tests) => {
                const testIds = new Set(tests.map((t: any) => t.id));
                const matched = this.allLabResults().filter(r => testIds.has(r.labTestId));
                this.appointments.update(list =>
                    list.map(a => a.id === appt.id
                        ? { ...a, labResults: matched, labLoaded: true }
                        : a)
                );
            },
            error: () => {
                this.appointments.update(list =>
                    list.map(a => a.id === appt.id
                        ? { ...a, labResults: [], labLoaded: true }
                        : a)
                );
            }
        });
    }

    askCancel(appointmentId: number) {
        this.showCancelConfirm.set(appointmentId);
    }

    closeCancelConfirm() {
        this.showCancelConfirm.set(null);
    }

    confirmCancel(appointmentId: number) {
        this.cancellingId.set(appointmentId);
        this.patientService.cancelAppointment(appointmentId).subscribe({
            next: () => {
                this.cancellingId.set(null);
                this.showCancelConfirm.set(null);
                const id = this.patientId();
                if (id) this.loadAppointments(id);
            },
            error: (err) => {
                this.cancellingId.set(null);
                this.showCancelConfirm.set(null);
                alert(err?.error?.message || 'Failed to cancel appointment');
            }
        });
    }

    goToBookAppointment() {
        const id = this.patientId();
        if (id) this.router.navigate(['/patient-dashboard', id, 'book']);
    }

    groupTotal(meds: DispenseRequestResponse[]): number {
        return meds.reduce((sum, m) => sum + (m.totalPrice || 0), 0);
    }
}