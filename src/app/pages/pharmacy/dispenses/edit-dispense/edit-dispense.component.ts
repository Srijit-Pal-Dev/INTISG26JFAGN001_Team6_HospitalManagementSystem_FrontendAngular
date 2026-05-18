import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DispenseService } from '../../../../core/services/dispense.service';
import { DispenseStateService } from '../../../../core/services/dispense-state.service';
import { MedicineItem, CreateDispenseRequest } from '../../../../core/models/dispense.model';

@Component({
  selector: 'app-edit-dispense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-dispense.component.html',
  styleUrls: ['./edit-dispense.component.css']
})
export class EditDispenseComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private dispenseService = inject(DispenseService);
  private stateService   = inject(DispenseStateService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);

  isEdit = false;
  submitting = false;
  apiError = '';
  success = false;

  form = this.fb.group({
    prescriptionId: [null as number | null, Validators.required],
    patientId:      [null as number | null, Validators.required],
    appointmentId:  [null as number | null, Validators.required],
    medicines: this.fb.array([this.newMedicineRow()])
  });

  get medicinesArray(): FormArray { return this.form.get('medicines') as FormArray; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.isEdit = true;

    const ctx = this.stateService.get();

    if (ctx?.group) {
      const g = ctx.group;
      this.form.patchValue({ prescriptionId: g.prescriptionId, patientId: g.patientId, appointmentId: g.appointmentId });
      while (this.medicinesArray.length) this.medicinesArray.removeAt(0);
      for (const item of g.items) {
        this.medicinesArray.push(this.fb.group({
          medicineId:   [item.medicineId, Validators.required],
          medicineName: [item.medicineName ?? ''],
          quantity:     [item.quantity, [Validators.required, Validators.min(1)]]
        }));
      }
      this.stateService.clear();
    }

    if (ctx?.selections) {
      while (this.medicinesArray.length) this.medicinesArray.removeAt(0);
      for (const sel of ctx.selections) {
        this.medicinesArray.push(this.fb.group({
          medicineId:   [sel.medicineId, Validators.required],
          medicineName: [sel.medicineName],
          quantity:     [sel.quantity, [Validators.required, Validators.min(1)]]
        }));
      }
      this.stateService.clear();
    }
  }

  newMedicineRow(): FormGroup {
    return this.fb.group({
      medicineId:   [null as number | null, Validators.required],
      medicineName: [''],
      quantity:     [1, [Validators.required, Validators.min(1)]]
    });
  }

  addRow(): void { this.medicinesArray.push(this.newMedicineRow()); }
  removeRow(i: number): void { this.medicinesArray.removeAt(i); }

  increment(i: number): void {
    const c = this.medicinesArray.at(i).get('quantity')!;
    c.setValue((c.value ?? 0) + 1);
  }
  decrement(i: number): void {
    const c = this.medicinesArray.at(i).get('quantity')!;
    if ((c.value ?? 1) > 1) c.setValue(c.value - 1);
  }

  invalid(f: string): boolean { const c = this.form.get(f); return !!(c?.invalid && c?.touched); }
  itemInvalid(i: number, f: string): boolean { const c = this.medicinesArray.at(i).get(f); return !!(c?.invalid && c?.touched); }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting = true; this.apiError = ''; this.success = false;

    const v = this.form.value;
    const payload: CreateDispenseRequest = {
      prescriptionId: v.prescriptionId!,
      patientId:      v.patientId!,
      appointmentId:  v.appointmentId!,
      medicines: (v.medicines as MedicineItem[]).map(m => ({ medicineId: m.medicineId, quantity: m.quantity }))
    };

    const onSuccess = () => {
      this.success = true; this.submitting = false;
      setTimeout(() => this.router.navigate(['/pharmacy-dashboard/dispenses']), 1500);
    };
    const onError = (err: { error?: { message?: string } }) => {
      this.apiError = err?.error?.message ?? 'Failed to save dispense request.';
      this.submitting = false;
    };

    if (this.isEdit) {
      this.dispenseService.update(v.prescriptionId!, payload).subscribe({ next: onSuccess, error: onError });
    } else {
      this.dispenseService.create(payload).subscribe({ next: onSuccess, error: onError });
    }
  }

  cancel(): void { this.router.navigate(['/pharmacy-dashboard/dispenses']); }
}
