import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MedicineService } from '../../../../core/services/medicine.service';

@Component({
  selector: 'app-add-medicine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-medicine.component.html',
  styleUrls: ['./add-medicine.component.css']
})
export class AddMedicineComponent implements OnInit {
  private fb = inject(FormBuilder);
  private medicineService = inject(MedicineService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  editId: number | null = null;
  submitting = false;
  apiError = '';
  success = false;

  readonly unitOptions = [
    'Tablet','Capsule','Syrup','Injection','Ointment','Cream',
    'Gel','Drops','Inhaler','Vial','Ampoule','Suspension','Patch'
  ];

  form = this.fb.group({
    name:                ['', Validators.required],
    category:            ['', Validators.required],
    manufacturer:        ['', Validators.required],
    unit:                ['', Validators.required],
    customUnit:          [''],
    dosageStrength:      ['', Validators.required],
    pricePerUnit:        [null as number | null, [Validators.required, Validators.min(0.01)]],
    stockQuantity:       [null as number | null, [Validators.required, Validators.min(0)]],
    requiresPrescription:[false]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      this.medicineService.getById(this.editId).subscribe({
        next: med => {
          const unitInList = this.unitOptions.includes(med.unit);
          this.form.patchValue({
            name: med.name, category: med.category,
            manufacturer: med.manufacturer,
            unit: unitInList ? med.unit : 'Other',
            customUnit: unitInList ? '' : med.unit,
            dosageStrength: med.dosageStrength,
            pricePerUnit: med.pricePerUnit,
            stockQuantity: med.stockQuantity,
            requiresPrescription: med.requiresPrescription
          });
        },
        error: () => { this.apiError = 'Failed to load medicine details.'; }
      });
    }
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  togglePrescription(): void {
    const c = this.form.get('requiresPrescription')!;
    c.setValue(!c.value);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const unit = this.form.value.unit === 'Other'
      ? (this.form.value.customUnit?.trim() || '')
      : this.form.value.unit;
    if (!unit) { this.form.get('customUnit')?.setErrors({ required: true }); return; }

    this.submitting = true; this.apiError = ''; this.success = false;

    const payload: any = { ...this.form.value, unit };
    delete payload.customUnit;

    const call = this.isEdit && this.editId
      ? this.medicineService.update(this.editId, payload)
      : this.medicineService.create(payload);

    call.subscribe({
      next: () => {
        this.success = true; this.submitting = false;
        setTimeout(() => this.router.navigate(['/pharmacy-dashboard/medicines']), 1500);
      },
      error: err => {
        this.apiError = err?.error?.message ?? err?.error ?? `Failed to save medicine. (HTTP ${err?.status})`;
        this.submitting = false;
      }
    });
  }

  cancel(): void { this.router.navigate(['/pharmacy-dashboard/medicines']); }
}
