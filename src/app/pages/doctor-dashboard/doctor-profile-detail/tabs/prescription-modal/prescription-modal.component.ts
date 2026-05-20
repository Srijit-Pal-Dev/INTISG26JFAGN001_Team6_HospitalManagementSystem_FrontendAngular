import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, Printer, FileText, Pill, FlaskConical, CheckCircle } from 'lucide-angular';
import { PrescriptionResponse } from '../../../../../core/models/index';

@Component({
    selector: 'app-prescription-modal',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './prescription-modal.component.html'
})
export class PrescriptionModalComponent {
    @Input() prescription!: PrescriptionResponse;
    @Output() closed = new EventEmitter<void>();

    readonly XIcon = X;
    readonly PrinterIcon = Printer;
    readonly RxIcon = FileText;
    readonly PillIcon = Pill;
    readonly LabIcon = FlaskConical;
    readonly CheckIcon = CheckCircle;

    print() { window.print(); }
    onClose() { this.closed.emit(); }

    formatDate(dateStr: string): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}