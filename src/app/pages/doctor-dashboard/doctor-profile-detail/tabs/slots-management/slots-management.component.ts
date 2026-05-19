import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, Plus, Trash2, Clock, Calendar, CheckCircle, XCircle, Layers } from 'lucide-angular';
import { DoctorService } from '../../../../../core/services/doctor.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { DoctorSlotDTO, CreateDoctorSlotRequest } from '../../../../../core/models/index'; // CreateDoctorSlotRequest used for single slot

@Component({
    selector: 'app-slots-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule
    ],
    templateUrl: './slots-management.component.html',
    styleUrl: './slots-management.component.css'
})
export class SlotsManagementComponent implements OnInit {
    readonly PlusIcon = Plus;
    readonly TrashIcon = Trash2;
    readonly ClockIcon = Clock;
    readonly CalendarIcon = Calendar;
    readonly CheckIcon = CheckCircle;
    readonly XIcon = XCircle;
    readonly BulkIcon = Layers;

    doctorId = signal<number>(0);
    slots = signal<DoctorSlotDTO[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');

    // Single slot form
    selectedDate = signal<Date | null>(null);
    slotTime = signal('');
    slotAvailability = signal<'available' | 'booked'>('available');
    isCreating = signal(false);
    createError = signal('');
    createSuccess = signal('');

    // Bulk slot form
    showBulkForm = signal(false);
    bulkDate = signal<Date | null>(null);
    bulkStartTime = signal('09:00');
    bulkEndTime = signal('17:00');
    bulkInterval = signal(30);
    bulkAvailability = signal<'available' | 'booked'>('available');
    isBulkCreating = signal(false);
    bulkError = signal('');
    bulkSuccess = signal('');

    // Delete
    deletingId = signal<number | null>(null);

    minDate = new Date();

    sortedSlots = computed(() =>
        [...this.slots()].sort((a, b) => {
            const dateCompare = a.slotDate.localeCompare(b.slotDate);
            if (dateCompare !== 0) return dateCompare;
            return a.slotTime.localeCompare(b.slotTime);
        })
    );

    availableSlots = computed(() => this.slots().filter(s => !s.booked).length);
    bookedSlots = computed(() => this.slots().filter(s => s.booked).length);

    private doctorService = inject(DoctorService);
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);

    get userId(): number {
        return this.authService.getUserId() ?? 0;
    }

    ngOnInit(): void {
        this.route.parent?.params.subscribe(params => {
            const id = Number(params['doctorId']);
            if (!isNaN(id) && id > 0) {
                this.doctorId.set(id);
                this.loadSlots();
            }
        });
    }

    loadSlots(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.doctorService.getSlotsByDoctor(this.doctorId()).subscribe({
            next: (slots) => {
                this.slots.set(slots);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set(err?.error?.message || 'Failed to load slots');
                this.isLoading.set(false);
            }
        });
    }

    onDateSelected(date: Date | null): void {
        this.selectedDate.set(date);
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

    formatDateForDisplay(dateStr: string): string {
        const [dd, mm, yyyy] = dateStr.split('-');
        const d = new Date(+yyyy, +mm - 1, +dd);
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    }

    createSlot(): void {
        const date = this.selectedDate();
        const time = this.slotTime().trim();
        if (!date || !time) {
            this.createError.set('Please select a date and enter a time.');
            return;
        }

        const req: CreateDoctorSlotRequest = {
            doctorId: this.doctorId(),
            userId: this.userId,
            slotDate: this.formatDateForBackend(date),
            slotTime: time,
            booked: this.slotAvailability() === 'booked'
        };

        this.isCreating.set(true);
        this.createError.set('');
        this.createSuccess.set('');

        this.doctorService.createSlot(req).subscribe({
            next: (slot) => {
                this.slots.update(list => [...list, slot]);
                this.isCreating.set(false);
                this.createSuccess.set('Slot created successfully!');
                this.slotTime.set('');
                this.selectedDate.set(null);
                this.slotAvailability.set('available');
                setTimeout(() => this.createSuccess.set(''), 3000);
            },
            error: (err) => {
                this.isCreating.set(false);
                this.createError.set(err?.error?.message || 'Failed to create slot');
            }
        });
    }

    generateBulkSlots(): void {
        const date = this.bulkDate();
        if (!date) {
            this.bulkError.set('Please select a date.');
            return;
        }

        const startParts = this.bulkStartTime().split(':').map(Number);
        const endParts = this.bulkEndTime().split(':').map(Number);
        const interval = this.bulkInterval();

        const startMinutes = startParts[0] * 60 + startParts[1];
        const endMinutes = endParts[0] * 60 + endParts[1];

        if (startMinutes >= endMinutes) {
            this.bulkError.set('End time must be after start time.');
            return;
        }

        const numberOfSlots = Math.floor((endMinutes - startMinutes) / interval);
        if (numberOfSlots < 1) {
            this.bulkError.set('Interval is too large for the selected time range.');
            return;
        }

        const dateStr = this.formatDateForBackend(date);

        this.isBulkCreating.set(true);
        this.bulkError.set('');
        this.bulkSuccess.set('');

        this.doctorService.createManySlots(
            this.doctorId(),
            dateStr,
            this.bulkStartTime(),
            numberOfSlots,
            interval,
            this.bulkAvailability() === 'booked'
        ).subscribe({
            next: (created) => {
                this.slots.update(list => [...list, ...created]);
                this.isBulkCreating.set(false);
                this.bulkSuccess.set(`${created.length} slots created successfully!`);
                this.bulkAvailability.set('available');
                this.showBulkForm.set(false);
                setTimeout(() => this.bulkSuccess.set(''), 4000);
            },
            error: (err) => {
                this.isBulkCreating.set(false);
                this.bulkError.set(err?.error?.message || 'Failed to create bulk slots');
            }
        });
    }

    deleteSlot(id: number): void {
        this.deletingId.set(id);
        this.doctorService.deleteSlot(id).subscribe({
            next: () => {
                this.slots.update(list => list.filter(s => s.id !== id));
                this.deletingId.set(null);
            },
            error: (err) => {
                this.deletingId.set(null);
                alert(err?.error?.message || 'Failed to delete slot');
            }
        });
    }

    onBulkDateSelected(date: Date | null): void {
        this.bulkDate.set(date);
    }
}
