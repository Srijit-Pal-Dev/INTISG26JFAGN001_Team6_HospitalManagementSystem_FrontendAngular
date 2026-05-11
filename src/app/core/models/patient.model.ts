export interface PatientDTO {
    id: number;
    userId: number;
    mrn: string;
    fullName: string;
    dob: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other' | string;
    bloodGroup: string;
    phoneNo: string;
    address: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePatientRequest {
    userId: number;
    fullName: string;
    dob: string;
    age: number;
    gender: string;
    bloodGroup: string;
    phoneNo: string;
    address: string;
}