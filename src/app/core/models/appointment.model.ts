export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
}

export interface AppointmentDTO {
    id: number;
    patientId: number;
    doctorId: number;
    slotId: number;
    reason: string;
    status: AppointmentStatus;
    appointmentDate: string;
    appointmentTime: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAppointmentRequest {
    patientId: number;
    doctorId: number;
    slotId: number;
    reason: string;
    appointmentDate: string;
    appointmentTime: string;
}