import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, GraduationCap, Briefcase, IndianRupee } from 'lucide-angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReviewsComponent } from '../../components/reviews/reviews.component';
import { CtaBannerComponent } from '../../components/cta-banner/cta-banner.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorDTO } from '../../core/models/index';

@Component({
    selector: 'app-doctors-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        LucideAngularModule,
        NavbarComponent,
        ReviewsComponent,
        CtaBannerComponent,
        FooterComponent
    ],
    templateUrl: './doctors-page.component.html'
})
export class DoctorsPageComponent implements OnInit {
    readonly SearchIcon = Search;
    readonly QualIcon = GraduationCap;
    readonly ExpIcon = Briefcase;
    readonly RupeeIcon = IndianRupee;

    doctors = signal<DoctorDTO[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');
    searchQuery = signal('');
    selectedSpecialty = signal('All');

    specialties = computed(() => {
        const all = this.doctors().map(d => d.specialty).filter(Boolean);
        return ['All', ...new Set(all)];
    });

    filteredDoctors = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const spec = this.selectedSpecialty();
        return this.doctors().filter(d => {
            const matchSpec = spec === 'All' || d.specialty === spec;
            const matchQ = !q ||
                d.fullName.toLowerCase().includes(q) ||
                d.specialty.toLowerCase().includes(q) ||
                d.qualification.toLowerCase().includes(q);
            return matchSpec && matchQ;
        });
    });

    private doctorService = inject(DoctorService);

    ngOnInit() {
        this.doctorService.getAllDoctors().subscribe({
            next: (list) => {
                this.doctors.set(list);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.errorMessage.set(err?.error?.message || 'Failed to load doctors');
                this.isLoading.set(false);
            }
        });
    }

    getInitials(name: string): string {
        return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    }

    clearFilters() {
        this.searchQuery.set('');
        this.selectedSpecialty.set('All');
    }
}