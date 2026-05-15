import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicineService } from '../../../../core/services/medicine.service';
import { DispenseStateService, PendingMedicineSelection } from '../../../../core/services/dispense-state.service';
import { Medicine } from '../../../../core/models/medicine.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicine-list.component.html',
  styleUrls: ['./medicine-list.component.css']
})
export class MedicineListComponent implements OnInit {
  private medicineService = inject(MedicineService);
  private stateService = inject(DispenseStateService);
  private router = inject(Router);

  medicines: Medicine[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  isNumericSearch = false;

  selections = new Map<number, { medicine: Medicine; qty: number }>();
  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.loadMedicines();

    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        const trimmed = q.trim();
        if (!trimmed) return this.medicineService.getAll().pipe(catchError(() => of([])));
        const asNumber = Number(trimmed);
        if (!isNaN(asNumber) && Number.isInteger(asNumber) && asNumber > 0) {
          return this.medicineService.getById(asNumber).pipe(
            catchError(() => of(null)),
            switchMap(m => of(m ? [m] : []))
          );
        }
        return this.medicineService.search(trimmed).pipe(catchError(() => of([])));
      })
    ).subscribe(data => {
      this.medicines = data as Medicine[];
      this.loading = false;
    });
  }

  loadMedicines(): void {
    this.loading = true; this.error = '';
    this.medicineService.getAll().subscribe({
      next: data => { this.medicines = data; this.loading = false; },
      error: (err) => { this.error = `Failed to load medicines. (${err?.status}: ${err?.error?.message ?? err?.message ?? 'Network error'})`; this.loading = false; }
    });
  }

  onSearch(q: string): void {
    this.loading = true;
    this.isNumericSearch = /^\d+$/.test(q.trim());
    this.search$.next(q);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isNumericSearch = false;
    this.search$.next('');
  }

  getQty(id: number): number { return this.selections.get(id)?.qty ?? 1; }

  setQty(id: number, event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && val >= 1) {
      const existing = this.selections.get(id);
      if (existing) existing.qty = val;
    }
  }

  increment(id: number, max: number): void {
    const existing = this.selections.get(id);
    if (existing && existing.qty < max) existing.qty++;
  }

  decrement(id: number): void {
    const existing = this.selections.get(id);
    if (existing && existing.qty > 1) existing.qty--;
  }

  toggleSelect(medicine: Medicine): void {
    if (this.selections.has(medicine.id)) {
      this.selections.delete(medicine.id);
    } else {
      this.selections.set(medicine.id, { medicine, qty: 1 });
    }
  }

  hasSelection(id: number): boolean { return this.selections.has(id); }
  clearSelections(): void { this.selections.clear(); }

  goToAdd(): void { this.router.navigate(['/pharmacy-dashboard/medicines/add']); }
  goToEdit(m: Medicine): void { this.router.navigate(['/pharmacy-dashboard/medicines/edit', m.id]); }
  goToDetail(m: Medicine): void { this.router.navigate(['/pharmacy-dashboard/medicines/detail', m.id]); }

  goToDispense(): void {
    if (this.selections.size === 0) return;
    const sels: PendingMedicineSelection[] = Array.from(this.selections.values()).map(s => ({
      medicineId: s.medicine.id,
      medicineName: `${s.medicine.name} ${s.medicine.dosageStrength}`,
      quantity: s.qty
    }));
    this.stateService.setSelections(sels);
    this.router.navigate(['/pharmacy-dashboard/dispenses/create']);
  }

  trackById(_: number, m: Medicine): number { return m.id; }

  getMedicineIcon(m: Medicine): string {
    const cat = m.unit ?? '';
    if (cat.includes('Syrup') || cat.includes('Suspension') || cat.includes('Drops'))
      return 'https://cdn-icons-png.flaticon.com/256/10306/10306262.png';
    if (cat.includes('Injection') || cat.includes('Vial') || cat.includes('Ampoule'))
      return 'https://cdn.iconscout.com/icon/free/png-512/medical-injection-drug-medicine-syringe-care-treatment-6-29863.png';
    if (cat.includes('Tablet') || cat.includes('Capsule'))
      return 'https://tse1.mm.bing.net/th/id/OIP.I7873gN48HfRVx1udgVDmAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3';
    return 'https://cdn-icons-png.flaticon.com/512/5245/5245522.png';
  }
}
