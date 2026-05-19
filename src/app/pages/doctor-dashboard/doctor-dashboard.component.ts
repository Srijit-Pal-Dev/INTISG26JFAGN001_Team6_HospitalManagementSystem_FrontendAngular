import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  UserPlus, Stethoscope, GraduationCap, Briefcase, IndianRupee,
  ArrowRight, CalendarDays, ClipboardList, FileText
} from 'lucide-angular';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { DoctorService } from '../../core/services/doctor.service';
import { AuthService } from '../../core/services/auth.service';
import { DoctorDTO, CreateDoctorProfileRequest } from '../../core/models/index';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, SidebarComponent],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit {
  readonly UserPlusIcon   = UserPlus;
  readonly StethoscopeIcon = Stethoscope;
  readonly QualIcon       = GraduationCap;
  readonly ExpIcon        = Briefcase;
  readonly RupeeIcon      = IndianRupee;
  readonly ArrowIcon      = ArrowRight;
  readonly CalendarIcon   = CalendarDays;
  readonly ClipboardIcon  = ClipboardList;
  readonly PrescriptionIcon = FileText;

  isLoading   = signal(true);
  isSubmitting = signal(false);
  submitError  = signal('');
  submitSuccess = signal('');
  profile = signal<DoctorDTO | null>(null);

  createForm!: FormGroup;

  private doctorService = inject(DoctorService);
  private authService   = inject(AuthService);
  private router        = inject(Router);
  private fb            = inject(FormBuilder);

  get currentUserId(): number { return this.authService.getUserId() ?? 0; }
  get username(): string { return this.authService.getUsername() ?? 'Doctor'; }
  hasProfile = () => this.profile() !== null;

  ngOnInit(): void {
    this.createForm = this.fb.group({
      fullName:        ['', [Validators.required, Validators.minLength(2)]],
      specialty:       ['', Validators.required],
      qualification:   ['', Validators.required],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      consultationFee: [0, [Validators.required, Validators.min(1)]]
    });
    this.checkProfile();
  }

  private checkProfile(): void {
    this.isLoading.set(true);
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: DoctorDTO[]) => {
        const mine = doctors.find(d => d.userId === this.currentUserId) ?? null;
        this.profile.set(mine);
        this.isLoading.set(false);
      },
      error: () => {
        this.profile.set(null);
        this.isLoading.set(false);
      }
    });
  }

  onCreateProfile(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;

    const req: CreateDoctorProfileRequest = {
      userId:          this.currentUserId,
      fullName:        this.createForm.value.fullName.trim(),
      specialty:       this.createForm.value.specialty.trim(),
      qualification:   this.createForm.value.qualification.trim(),
      experienceYears: this.createForm.value.experienceYears,
      consultationFee: this.createForm.value.consultationFee
    };

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.doctorService.createDoctorProfile(req).subscribe({
      next: (created) => {
        this.profile.set(created);
        this.isSubmitting.set(false);
        this.submitSuccess.set('Profile created successfully!');
        setTimeout(() => this.submitSuccess.set(''), 3000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set(err?.error?.message || 'Failed to create profile. Please try again.');
      }
    });
  }

  goToProfile(): void {
    const p = this.profile();
    if (p) this.router.navigate(['/doctor-dashboard', p.id]);
  }

  goToSlots(): void {
    const p = this.profile();
    if (p) this.router.navigate(['/doctor-dashboard', p.id, 'slots']);
  }

  goToAppointments(): void {
    const p = this.profile();
    if (p) this.router.navigate(['/doctor-dashboard', p.id, 'appointments']);
  }

  getInitials(name: string): string {
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onNavClicked(route: string): void {
    const p = this.profile();
    if (route === 'overview') {
      this.router.navigate(['/doctor-dashboard']);
    } else if (route === 'slots' && p) {
      this.router.navigate(['/doctor-dashboard', p.id, 'slots']);
    } else if (route === 'appointments' && p) {
      this.router.navigate(['/doctor-dashboard', p.id, 'appointments']);
    }
  }

  onNotifClicked(): void {
    // Notifications page not yet implemented for doctors
  }

  logout(): void { this.authService.logout(); }
}
