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