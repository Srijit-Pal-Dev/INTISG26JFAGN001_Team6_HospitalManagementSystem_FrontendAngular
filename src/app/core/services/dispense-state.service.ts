import { Injectable } from '@angular/core';
import { DispenseGroup } from '../models/dispense.model';
import { DispenseRequestResponse } from '../models/medicine.model';

export interface PendingMedicineSelection {
  medicineId: number;
  medicineName: string;
  quantity: number;
}

export interface DispenseEditContext {
  group?: DispenseGroup;
  selections?: PendingMedicineSelection[];
}

@Injectable({ providedIn: 'root' })
export class DispenseStateService {
  private _context: DispenseEditContext | null = null;

  setGroup(group: DispenseGroup): void {
    this._context = { group };
  }

  setSelections(selections: PendingMedicineSelection[]): void {
    this._context = { selections };
  }

  get(): DispenseEditContext | null {
    return this._context;
  }

  clear(): void {
    this._context = null;
  }
}
