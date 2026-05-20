export interface DoctorDTO {
    id: number;
    userId: number;
    fullName: string;
    specialty: string;
    qualification: string;
    experienceYears: number;
    consultationFee: number;
}

export interface CreateDoctorProfileRequest {
    userId: number;
    fullName: string;
    specialty: string;
    qualification: string;
    experienceYears: number;
    consultationFee: number;
}

export interface DoctorSlotDTO {
    id: number;
    doctorId: number;
    userId: number;
    slotDate: string;
    slotTime: string;
    booked: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateDoctorSlotRequest {
    doctorId: number;
    userId: number;
    slotDate: string;
    slotTime: string;
    booked: boolean;
}