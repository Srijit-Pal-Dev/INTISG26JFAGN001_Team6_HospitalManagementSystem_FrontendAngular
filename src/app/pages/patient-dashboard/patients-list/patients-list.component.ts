import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LucideAngularModule, Plus, Users } from 'lucide-angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { PatientFormModalComponent } from './patient-form-modal/patient-form-modal.component';
import { InvoiceModalComponent } from './invoice-modal/invoice-modal.component';
import { MediclaimModalComponent } from '../patient-detail/mediclaim-modal/mediclaim-modal.component';
import { PatientCardsComponent } from './patient-cards/patient-cards.component';
import { BillingSectionComponent } from './billing-section/billing-section.component';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { MediclaimService } from '../../../core/services/mediclaim.service';
import { PatientDTO, InvoiceDTO, InvoiceStatus, MediclaimDTO } from '../../../core/models/index';

type BillingTab = 'pending' | 'paid';

@Component({
    selector: 'app-patients-list',
    standalone: true,
    imports: [
        CommonModule, LucideAngularModule,
        NavbarComponent, FooterComponent,
        PatientFormModalComponent, InvoiceModalComponent,
        MediclaimModalComponent, PatientCardsComponent, BillingSectionComponent
    ],
    templateUrl: './patients-list.component.html'
})
export class PatientsListComponent implements OnInit {
    readonly PlusIcon = Plus;
    readonly UsersIcon = Users;

    patients = signal<PatientDTO[]>([]);
    isLoading = signal(true);
    errorMessage = signal('');

    allInvoices = signal<InvoiceDTO[]>([]);
    invoicesLoading = signal(false);
    billingTab = signal<BillingTab>('pending');
    selectedInvoice = signal<InvoiceDTO | null>(null);
    allMediclaims = signal<MediclaimDTO[]>([]);
    mediclaimInvoice = signal<InvoiceDTO | null>(null);
    modalOpen = signal(false);
    editingPatient = signal<PatientDTO | null>(null);

    readonly InvoiceStatus = InvoiceStatus;

    pendingInvoices = computed(() =>
        this.allInvoices().filter(i =>
            i.invoiceStatus === InvoiceStatus.PENDING || i.invoiceStatus === InvoiceStatus.READY
        )
    );

    paidInvoices = computed(() =>
        this.allInvoices().filter(i => i.invoiceStatus === InvoiceStatus.PAID)
    );

    private patientService = inject(PatientService);
    private authService = inject(AuthService);
    private invoiceService = inject(InvoiceService);
    private mediclaimService = inject(MediclaimService);
    private router = inject(Router);

    ngOnInit() { this.loadPatients(); }

    loadPatients() {
        const userId = this.authService.getUserId();
        if (!userId) { this.errorMessage.set('Unable to identify user.'); this.isLoading.set(false); return; }

        this.isLoading.set(true);
        this.patientService.getPatientsByUserId(userId).subscribe({
            next: (list) => {
                this.patients.set(list);
                this.isLoading.set(false);
                if (list.length > 0) { this.loadAllInvoices(list); this.loadAllMediclaims(list); }
            },
            error: (err) => {
                if (err?.status === 404) this.patients.set([]);
                else this.errorMessage.set(err?.error?.message || 'Failed to load patients');
                this.isLoading.set(false);
            }
        });
    }

    loadAllInvoices(patients: PatientDTO[]) {
        this.invoicesLoading.set(true);
        forkJoin(patients.map(p => this.invoiceService.getInvoicesByPatient(p.id).pipe(catchError(() => of([]))))).subscribe({
            next: (results) => {
                const all = (results.flat() as InvoiceDTO[]).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                this.allInvoices.set(all);
                this.invoicesLoading.set(false);
            },
            error: () => this.invoicesLoading.set(false)
        });
    }

    loadAllMediclaims(patients: PatientDTO[]) {
        forkJoin(patients.map(p => this.mediclaimService.getMediclaimsByPatient(p.id).pipe(catchError(() => of([]))))).subscribe({
            next: (results) => this.allMediclaims.set(results.flat() as MediclaimDTO[]),
            error: () => { }
        });
    }

    getMediclaimForInvoice(invoiceId: number): MediclaimDTO | null {
        return this.allMediclaims().find(m => m.invoiceId === invoiceId) ?? null;
    }

    openAddModal() { this.editingPatient.set(null); this.modalOpen.set(true); }

    openEditModal(data: { patient: PatientDTO; event: MouseEvent }) {
        data.event.stopPropagation();
        this.editingPatient.set(data.patient);
        this.modalOpen.set(true);
    }

    onModalClosed() { this.modalOpen.set(false); this.editingPatient.set(null); }
    onPatientSaved(_: PatientDTO) { this.modalOpen.set(false); this.editingPatient.set(null); this.loadPatients(); }

    openPatientDashboard(patient: PatientDTO) {
        this.router.navigate(['/patient-dashboard', patient.id]);
    }

    openInvoice(data: { invoice: InvoiceDTO; event: MouseEvent }) {
        data.event.stopPropagation();
        this.selectedInvoice.set(data.invoice);
    }

    closeInvoice() { this.selectedInvoice.set(null); }

    onPaymentCompleted(invoiceId: number) {
        this.allInvoices.update(list =>
            list.map(inv => inv.id === invoiceId ? { ...inv, invoiceStatus: InvoiceStatus.PAID } : inv)
        );
        this.closeInvoice();
        setTimeout(() => { if (this.patients().length > 0) this.loadAllInvoices(this.patients()); }, 1000);
    }

    onMediclaimSubmitted(mediclaim: MediclaimDTO) {
        this.allMediclaims.update(list => [...list, mediclaim]);
        this.closeInvoice();
    }

    openMediclaimFromCard(data: { invoice: InvoiceDTO; event: MouseEvent }) {
        data.event.stopPropagation();
        this.mediclaimInvoice.set(data.invoice);
    }

    closeMediclaimModal() { this.mediclaimInvoice.set(null); }

    onMediclaimSubmittedFromCard(mediclaim: MediclaimDTO) {
        this.allMediclaims.update(list => [...list, mediclaim]);
        this.mediclaimInvoice.set(null);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    formatAmount(amount: number): string {
        return amount?.toFixed(2) ?? '0.00';
    }
}