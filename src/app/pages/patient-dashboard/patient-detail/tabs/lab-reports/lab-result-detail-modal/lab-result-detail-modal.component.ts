import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Printer, AlertCircle, CheckCircle } from 'lucide-angular';
import { LabResultResponse, PatientDTO } from '../../../../../../core/models/index';

@Component({
    selector: 'app-lab-result-detail-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './lab-result-detail-modal.component.html'
})
export class LabResultDetailModalComponent {
    @Input() result!: LabResultResponse;
    @Input() patient!: PatientDTO | null;
    @Output() closed = new EventEmitter<void>();

    readonly XIcon = X;
    readonly PrinterIcon = Printer;
    readonly AlertIcon = AlertCircle;
    readonly CheckIcon = CheckCircle;

    formatDate(iso: string): string {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    printReport() {
        window.print();
    }

    onClose() {
        this.closed.emit();
    }
}