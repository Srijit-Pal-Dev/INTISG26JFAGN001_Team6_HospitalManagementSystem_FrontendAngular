export interface DispenseRequestResponse {
  id: number;
  prescriptionId: number;
  patientId: number;
  appointmentId: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  dispensedAt: string;
  createdAt: string;
}

export interface Medicine {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  unit: string;
  dosageStrength: string;
  pricePerUnit: number;
  stockQuantity: number;
  requiresPrescription: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicineRequest {
  name: string;
  category: string;
  manufacturer: string;
  unit: string;
  dosageStrength: string;
  pricePerUnit: number;
  stockQuantity: number;
  requiresPrescription: boolean;
}
