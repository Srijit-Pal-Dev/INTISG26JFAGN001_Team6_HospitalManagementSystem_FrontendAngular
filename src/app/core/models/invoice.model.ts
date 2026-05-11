import { PatientDTO } from './patient.model';
import { DoctorDTO } from './doctor.model';
import { AppointmentDTO } from './appointment.model';

export enum InvoiceStatus {
    PENDING = 'PENDING',
    READY = 'READY',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
    CARD = 'CARD',
    UPI = 'UPI',
    CASH = 'CASH'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface PaymentDTO {
    id: number;
    appointmentId: number;
    patientId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionId: string;
    paymentStatus: PaymentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceDTO {
    id: number;
    invoiceNumber: string;
    patientId: number;
    doctorId: number;
    appointmentId: number;
    consultationFee: number;
    medicineFee: number;
    labFee: number;
    totalAmount: number;
    invoiceStatus: InvoiceStatus;
    createdAt: string;
    updatedAt: string;
    payment?: PaymentDTO;
    patient?: PatientDTO;
    doctor?: DoctorDTO;
    appointment?: AppointmentDTO;
}

export interface MediclaimDTO {
    id?: number;
    patientId: number;
    invoiceId: number;
    paymentId?: number;
    policyNumber: string;
    insurerName: string;
    coveragePercentage: number;
    refundAmount?: number;
    status?: string;
    appliedAt?: string;
    processedAt?: string;
}