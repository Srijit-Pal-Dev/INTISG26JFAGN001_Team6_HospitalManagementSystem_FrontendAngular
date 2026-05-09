import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
    LucideAngularModule, FlaskConical, Search, AlertCircle, CheckCircle,
    Calendar, Eye, IndianRupee
} from 'lucide-angular';
import { PatientService } from '../../../../../core/services/patient.service';
import { LabResultService } from '../../../../../core/services/lab-result.service';
import { LabResultResponse, PatientDTO } from '../../../../../core/models/index';
import { LabResultDetailModalComponent } from './lab-result-detail-modal/lab-result-detail-modal.component';

type FilterMode = 'all' | 'abnormal' | 'normal';

@Component({
    selector: 'app-lab-reports',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, LabResultDetailModalComponent],
    templateUrl: './lab-reports.component.html'
})
export class LabReportsComponent implements OnInit {
    readonly FlaskIcon = FlaskConical;
    readonly SearchIcon = Search;
    readonly AlertIcon = AlertCircle;
    readonly CheckIcon = CheckCircle;
    readonly CalendarIcon = Calendar;
    readonly EyeIcon = Eye;
    readonly RupeeIcon = IndianRupee;

    patientId = signal<number | null>(null);
    patient = signal<PatientDTO | null>(null);

    results = signal<LabResultResponse[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');

    searchQuery = signal('');
    filterMode = signal<FilterMode>('all');
    selectedResult = signal<LabResultResponse | null>(null);

    filteredResults = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const mode = this.filterMode();

        return this.results().filter(r => {
            if (mode === 'abnormal' && !r.isAbnormal) return false;
            if (mode === 'normal' && r.isAbnormal) return false;
            if (q) {
                const haystack = `${r.resultValue} ${r.unit} ${r.notes ?? ''} ${r.recordedBy ?? ''}`.toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });
    });

    abnormalCount = computed(() => this.results().filter(r => r.isAbnormal).length);
    normalCount = computed(() => this.results().filter(r => !r.isAbnormal).length);

    private patientService = inject(PatientService);
    private labService = inject(LabResultService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit() {
        this.route.parent?.params.subscribe(params => {
            const id = Number(params['patientId']);
            if (!isNaN(id)) {
                this.patientId.set(id);
                this.loadPatient(id);
                this.loadResults(id);
            }
        });
    }

    loadPatient(id: number) {
        this.patientService.getPatientById(id).subscribe({
            next: (p) => this.patient.set(p),
            error: () => this.patient.set(null)
        });
    }

    loadResults(patientId: number) {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.labService.getResultsByPatient(patientId).subscribe({
            next: (list) => {
                const sorted = [...list].sort((a, b) =>
                    new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
                );
                this.results.set(sorted);
                this.isLoading.set(false);
            },
            error: (err) => {
                if (err?.status === 404) {
                    this.results.set([]);
                } else {
                    this.errorMessage.set(
                        err?.error?.message || `Error ${err?.status}: ${err?.statusText || 'Failed to load lab reports'}`
                    );
                }
                this.isLoading.set(false);
            }
        });
    }

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    formatTime(iso: string): string {
        return new Date(iso).toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit'
        });
    }

    setFilter(mode: FilterMode) {
        this.filterMode.set(mode);
    }

    openDetail(result: LabResultResponse) {
        this.selectedResult.set(result);
    }

    closeDetail() {
        this.selectedResult.set(null);
    }

    goToBook() {
        const id = this.patientId();
        if (id) this.router.navigate(['/patient-dashboard', id, 'book']);
    }
}