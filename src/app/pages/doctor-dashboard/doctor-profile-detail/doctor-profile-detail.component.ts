import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { LucideAngularModule, ArrowLeft, GraduationCap, Briefcase, IndianRupee, CalendarDays, ClipboardList, Pencil, X } from 'lucide-angular';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { DoctorService } from '../../../core/services/doctor.service';
import { AuthService } from '../../../core/services/auth.service';
import { DoctorDTO, CreateDoctorProfileRequest } from '../../../core/models/index';

type DoctorTab = 'slots' | 'appointments';

@Component({
    selector: 'app-doctor-profile-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LucideAngularModule, SidebarComponent],
    templateUrl: './doctor-profile-detail.component.html',
    styleUrl: './doctor-profile-detail.component.css'
})
export class DoctorProfileDetailComponent implements OnInit {
    readonly ArrowLeftIcon = ArrowLeft;
    readonly QualIcon = GraduationCap;
    readonly ExpIcon = Briefcase;
    readonly RupeeIcon = IndianRupee;
    readonly SlotsIcon = CalendarDays;
    readonly AppointmentsIcon = ClipboardList;
    readonly EditIcon = Pencil;
    readonly XIcon = X;

    doctor = signal<DoctorDTO | null>(null);
    isLoading = signal(true);
    errorMessage = signal('');
    activeTab = signal<DoctorTab>('slots');
    doctorId = signal<number>(0);

    showEditModal = signal(false);
    isSubmitting = signal(false);
    editError = signal('');
    editSuccess = signal('');

    editForm!: FormGroup;

    private doctorService = inject(DoctorService);
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fb = inject(FormBuilder);

    get currentUserId(): number {
        return this.authService.getUserId() ?? 0;
    }

    get isMyProfile(): boolean {
        return this.doctor()?.userId === this.currentUserId;
    }

    ngOnInit(): void {
        this.editForm = this.fb.group({
            fullName:        ['', [Validators.required, Validators.minLength(2)]],
            specialty:       ['', Validators.required],
            qualification:   ['', Validators.required],
            experienceYears: [0, [Validators.required, Validators.min(0)]],
            consultationFee: [0, [Validators.required, Validators.min(1)]]
        });

        this.route.params.subscribe(params => {
            const id = Number(params['doctorId']);
            if (!isNaN(id) && id > 0) {
                this.doctorId.set(id);
                this.loadDoctor(id);
            }
        });

        this.syncTabFromUrl(this.router.url);
        this.router.events.pipe(filter(e => e instanceof NavigationEnd))
            .subscribe((e: any) => this.syncTabFromUrl(e.urlAfterRedirects));
    }

    private syncTabFromUrl(url: string): void {
        if (url.includes('/appointments') || url.includes('/prescription')) {
            this.activeTab.set('appointments');
        } else {
            this.activeTab.set('slots');
        }
    }

    loadDoctor(id: number): void {
        this.isLoading.set(true);
        this.doctorService.getDoctorById(id).subscribe({
            next: (doc) => {
                this.doctor.set(doc);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set(err?.error?.message || 'Failed to load doctor profile');
                this.isLoading.set(false);
            }
        });
    }

    openEditModal(): void {
        const doc = this.doctor();
        if (!doc) return;
        this.editForm.patchValue({
            fullName: doc.fullName,
            specialty: doc.specialty,
            qualification: doc.qualification,
            experienceYears: doc.experienceYears,
            consultationFee: doc.consultationFee
        });
        this.editError.set('');
        this.editSuccess.set('');
        this.showEditModal.set(true);
    }

    closeEditModal(): void {
        this.showEditModal.set(false);
    }

    onSaveProfile(): void {
        this.editForm.markAllAsTouched();
        if (this.editForm.invalid) return;

        const req: CreateDoctorProfileRequest = {
            userId: this.currentUserId,
            fullName: this.editForm.value.fullName.trim(),
            specialty: this.editForm.value.specialty.trim(),
            qualification: this.editForm.value.qualification.trim(),
            experienceYears: this.editForm.value.experienceYears,
            consultationFee: this.editForm.value.consultationFee
        };

        this.isSubmitting.set(true);
        this.editError.set('');
        this.doctorService.updateDoctorProfile(this.currentUserId, req).subscribe({
            next: (updated) => {
                this.doctor.set(updated);
                this.isSubmitting.set(false);
                this.editSuccess.set('Profile updated successfully!');
                setTimeout(() => this.closeEditModal(), 1200);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                this.editError.set(err?.error?.message || 'Failed to update profile');
            }
        });
    }

    setTab(tab: DoctorTab): void {
        this.activeTab.set(tab);
        this.router.navigate(['/doctor-dashboard', this.doctorId(), tab]);
    }

    onNavClicked(route: string): void {
        if (route === 'overview') {
            this.router.navigate(['/doctor-dashboard']);
        } else if (route === 'slots') {
            this.setTab('slots');
        } else if (route === 'appointments') {
            this.setTab('appointments');
        }
    }

    onNotifClicked(): void {
        // Notifications page not yet implemented for doctors
    }

    goBack(): void {
        this.router.navigate(['/doctor-dashboard']);
    }

    getInitials(name: string): string {
        return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    logout(): void {
        this.authService.logout();
    }
}
