import { DispenseRequestResponse } from './medicine.model';

export interface MedicineItem {
  medicineId: number;
  quantity: number;
  medicineName?: string;
}

export interface CreateDispenseRequest {
  prescriptionId: number;
  patientId: number;
  appointmentId: number;
  medicines: MedicineItem[];
}

export interface DispenseGroup {
  patientId: number;
  prescriptionId: number;
  appointmentId: number;
  items: DispenseRequestResponse[];
  totalPrice: number;
  patientName?: string;
}
