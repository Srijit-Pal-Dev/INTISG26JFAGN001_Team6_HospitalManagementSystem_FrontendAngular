export interface PrescriptionMedicineItem {
    medicineId?: number;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity?: number;
}

export interface PrescriptionLabTestItem {
    testName: string;
    notes?: string;
    fee?: number;
}

export interface CreatePrescriptionRequest {
    appointmentId: number;
    patientId: number;
    diagnosis: string;
    doctorNotes?: string;
    labRequired: boolean;
    medicines: PrescriptionMedicineItem[];
    labTests: PrescriptionLabTestItem[];
}

export interface PrescriptionResponse {
    id: number;
    appointmentId: number;
    patientId: number;
    doctorId: number;
    doctorName: string;
    diagnosis: string;
    doctorNotes?: string;
    labRequired: boolean;
    medicines: PrescriptionMedicineItem[];
    labTests: PrescriptionLabTestItem[];
    createdAt: string;
}
