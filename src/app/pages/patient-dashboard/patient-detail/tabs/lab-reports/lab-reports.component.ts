import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    LucideAngularModule, FlaskConical, Search, AlertCircle,
    CheckCircle, Calendar, Eye, IndianRupee, Lock
} from 'lucide-angular';
import { PatientService } from '../../../../../core/services/patient.service';
import { LabResultService } from '../../../../../core/services/lab-result.service';
import { InvoiceService } from '../../../../../core/services/invoice.service';
import {
    LabResultResponse, PatientDTO,
    InvoiceDTO, InvoiceStatus, AppointmentStatus
} from '../../../../../core/models/index';
import { LabResultDetailModalComponent } from './lab-result-detail-modal/lab-result-detail-modal.component';

type FilterMode = 'all' | 'abnormal' | 'normal';

@Component({
    selector: 'app-lab-reports',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, LabResultDetailModalComponent, FormsModule],
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
    readonly LockIcon = Lock;

    readonly InvoiceStatus = InvoiceStatus;

    patientId = signal<number | null>(null);
    patient = signal<PatientDTO | null>(null);

    results = signal<LabResultResponse[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');
    searchQuery = signal('');
    filterMode = signal<FilterMode>('all');
    selectedResult = signal<LabResultResponse | null>(null);

    // labTestId → paid or not
    paidLabTestIds = signal<Set<number>>(new Set());
    invoicesLoaded = signal(false);

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

    // Only show results that are paid
    paidFilteredResults = computed(() =>
        this.filteredResults().filter(r => this.isLabResultPaid(r))
    );

    // Results that exist but are locked
    lockedResults = computed(() =>
        this.filteredResults().filter(r => !this.isLabResultPaid(r))
    );

    abnormalCount = computed(() =>
        this.paidFilteredResults().filter(r => r.isAbnormal).length
    );
    normalCount = computed(() =>
        this.paidFilteredResults().filter(r => !r.isAbnormal).length
    );

    private patientService = inject(PatientService);
    private labService = inject(LabResultService);
    private invoiceService = inject(InvoiceService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    ngOnInit() {
        this.route.parent?.params.subscribe(params => {
            const id = Number(params['patientId']);
            if (!isNaN(id)) {
                this.patientId.set(id);
                this.loadPatient(id);
                this.loadResults(id);
                this.loadPaidLabTestIds(id);
            }
        });
    }

    loadPatient(id: number) {
        this.patientService.getPatientById(id).subscribe({
            next: (p) => this.patient.set(p),
            error: () => this.patient.set(null)
        });
    }

    loadPaidLabTestIds(patientId: number) {
        // Step 1: get all invoices for patient
        this.invoiceService.getInvoicesByPatient(patientId).subscribe({
            next: (invoices) => {
                // Step 2: filter only PAID invoices
                const paidInvoices = invoices.filter(
                    inv => inv.invoiceStatus === InvoiceStatus.PAID && inv.appointmentId
                );

                if (paidInvoices.length === 0) {
                    this.paidLabTestIds.set(new Set());
                    this.invoicesLoaded.set(true);
                    return;
                }

                // Step 3: for each paid invoice fetch lab tests of that appointment
                const labTestRequests = paidInvoices.map(inv =>
                    this.labService.getTestsByAppointment(inv.appointmentId).pipe(
                        catchError(() => of([]))
                    )
                );

                forkJoin(labTestRequests).subscribe({
                    next: (testGroups) => {
                        const paidIds = new Set<number>();
                        testGroups.flat().forEach((test: any) => {
                            if (test?.id) paidIds.add(test.id);
                        });
                        this.paidLabTestIds.set(paidIds);
                        this.invoicesLoaded.set(true);
                    },
                    error: () => {
                        this.paidLabTestIds.set(new Set());
                        this.invoicesLoaded.set(true);
                    }
                });
            },
            error: () => {
                this.paidLabTestIds.set(new Set());
                this.invoicesLoaded.set(true);
            }
        });
    }

    isLabResultPaid(result: LabResultResponse): boolean {
        return this.paidLabTestIds().has(result.labTestId);
    }

    hasAnyPaidResult(): boolean {
        return this.results().some(r => this.isLabResultPaid(r));
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
                    this.errorMessage.set(err?.error?.message || 'Failed to load lab reports');
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

    setFilter(mode: FilterMode) { this.filterMode.set(mode); }
    openDetail(result: LabResultResponse) { this.selectedResult.set(result); }
    closeDetail() { this.selectedResult.set(null); }

    goToBook() {
        const id = this.patientId();
        if (id) this.router.navigate(['/patient-dashboard', id, 'book']);
    }
}