import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, Search, Check, IndianRupee, GraduationCap, Briefcase, Calendar, Clock, FileText, X, CalendarCheck } from 'lucide-angular';
import { DoctorService } from '../../../../../core/services/doctor.service';
import { PatientService } from '../../../../../core/services/patient.service';
import { DoctorDTO, DoctorSlotDTO, CreateAppointmentRequest } from '../../../../../core/models/index';

@Component({
    selector: 'app-book-appointment',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './book-appointment.component.html',
    styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent implements OnInit {
    readonly SearchIcon = Search;
    readonly CheckIcon = Check;
    readonly RupeeIcon = IndianRupee;
    readonly QualificationIcon = GraduationCap;
    readonly ExperienceIcon = Briefcase;
    readonly CalendarIcon = Calendar;
    readonly ClockIcon = Clock;
    readonly ReasonIcon = FileText;
    readonly XIcon = X;
    readonly SuccessIcon = CalendarCheck;

    patientId = signal<number | null>(null);

    doctors = signal<DoctorDTO[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');

    searchQuery = signal('');
    selectedDoctor = signal<DoctorDTO | null>(null);

    allSlots = signal<DoctorSlotDTO[]>([]);
    slotsLoading = signal(false);
    slotsError = signal('');

    selectedDate = signal<Date | null>(null);
    selectedSlot = signal<DoctorSlotDTO | null>(null);
    reason = signal('');

    isBooking = signal(false);
    bookingError = signal('');
    showSuccessModal = signal(false);

    minDate = new Date();
    maxDate = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return d;
    })();

    filteredDoctors = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        if (!query) return this.doctors();
        return this.doctors().filter(d =>
            d.fullName.toLowerCase().includes(query) ||
            d.specialty.toLowerCase().includes(query) ||
            d.qualification.toLowerCase().includes(query)
        );
    });

    availableSlotsForDate = computed(() => {
        const date = this.selectedDate();
        if (!date) return [];

        const dateStr = this.formatDateForBackend(date);
        return this.allSlots()
            .filter(s => !s.booked && s.slotDate === dateStr)
            .sort((a, b) => a.slotTime.localeCompare(b.slotTime));
    });

    datesWithSlots = computed(() => {
        const dates = new Set<string>();
        this.allSlots().forEach(s => {
            if (!s.booked) dates.add(s.slotDate);
        });
        return dates;
    });

    canBook = computed(() => {
        return !!(
            this.patientId() &&
            this.selectedDoctor() &&
            this.selectedDate() &&
            this.selectedSlot() &&
            this.reason().trim().length >= 5
        );
    });

    private doctorService = inject(DoctorService);
    private patientService = inject(PatientService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit() {
        this.route.parent?.params.subscribe(params => {
            const id = Number(params['patientId']);
            if (!isNaN(id)) {
                this.patientId.set(id);
            } else {
                console.error('Could not read patientId from route params:', params);
            }
        });

        this.loadDoctors();
    }

    loadDoctors() {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.doctorService.getAllDoctors().subscribe({
            next: (list) => {
                this.doctors.set(list);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set(
                    err?.error?.message || `Error ${err?.status}: ${err?.statusText || 'Failed to load doctors'}`
                );
                this.isLoading.set(false);
            }
        });
    }

    selectDoctor(doctor: DoctorDTO) {
        if (this.selectedDoctor()?.id === doctor.id) {
            this.selectedDoctor.set(null);
            this.selectedDate.set(null);
            this.selectedSlot.set(null);
            this.allSlots.set([]);
            return;
        }

        this.selectedDoctor.set(doctor);
        this.selectedDate.set(null);
        this.selectedSlot.set(null);
        this.loadSlots(doctor.id);
    }

    loadSlots(doctorId: number) {
        this.slotsLoading.set(true);
        this.slotsError.set('');
        this.doctorService.getSlotsByDoctor(doctorId).subscribe({
            next: (slots) => {
                this.allSlots.set(slots);
                this.slotsLoading.set(false);
            },
            error: (err) => {
                this.slotsError.set(
                    err?.error?.message || `Error ${err?.status}: ${err?.statusText || 'Failed to load slots'}`
                );
                this.slotsLoading.set(false);
            }
        });
    }

    isSelected(doctor: DoctorDTO): boolean {
        return this.selectedDoctor()?.id === doctor.id;
    }

    clearSearch() {
        this.searchQuery.set('');
    }

    onDateSelected(date: Date | null) {
        this.selectedDate.set(date);
        this.selectedSlot.set(null);
    }

    selectSlot(slot: DoctorSlotDTO) {
        this.selectedSlot.set(slot);
    }

    isSlotSelected(slot: DoctorSlotDTO): boolean {
        return this.selectedSlot()?.id === slot.id;
    }

    formatDateForBackend(date: Date): string {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }

    formatTimeForDisplay(time: string): string {
        const [h, m] = time.split(':');
        const hour = parseInt(h, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${display}:${m} ${period}`;
    }

    formatDateForDisplay(date: Date | null): string {
        if (!date) return '';
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    bookAppointment() {
        if (!this.canBook()) return;

        const patient = this.patientId();
        const doctor = this.selectedDoctor();
        const date = this.selectedDate();
        const slot = this.selectedSlot();

        if (!patient || !doctor || !date || !slot) return;

        const request: CreateAppointmentRequest = {
            patientId: patient,
            doctorId: doctor.id,
            slotId: slot.id,
            reason: this.reason().trim(),
            appointmentDate: this.formatDateForBackend(date),
            appointmentTime: slot.slotTime
        };

        this.isBooking.set(true);
        this.bookingError.set('');

        this.patientService.createAppointment(request).subscribe({
            next: () => {
                this.isBooking.set(false);
                this.showSuccessModal.set(true);
            },
            error: (err) => {
                this.isBooking.set(false);
                this.bookingError.set(
                    err?.error?.message || `Booking failed: ${err?.statusText || 'Please try again'}`
                );
            }
        });
    }

    closeSuccessAndReset() {
        this.showSuccessModal.set(false);
        this.selectedDoctor.set(null);
        this.selectedDate.set(null);
        this.selectedSlot.set(null);
        this.allSlots.set([]);
        this.reason.set('');
        this.bookingError.set('');
    }

    goToMyAppointments() {
        this.showSuccessModal.set(false);
        this.router.navigate(['/patient-dashboard', this.patientId(), 'appointments']);
    }
}