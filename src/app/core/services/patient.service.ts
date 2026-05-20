import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    PatientDTO,
    CreatePatientRequest,
    AppointmentDTO,
    CreateAppointmentRequest,
    ApiResponse
} from '../models/index';

@Injectable({ providedIn: 'root' })
export class PatientService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiGatewayUrl}`;


    getPatientById(id: number): Observable<PatientDTO> {
        return this.http
            .get<ApiResponse<PatientDTO>>(`${this.baseUrl}/patient/id/${id}`)
            .pipe(map(r => r.data));
    }

    getPatientByMrn(mrn: string): Observable<PatientDTO> {
        return this.http
            .get<ApiResponse<PatientDTO>>(`${this.baseUrl}/patient/mrn/${mrn}`)
            .pipe(map(r => r.data));
    }


    getPatientsByUserId(userId: number): Observable<PatientDTO[]> {
        return this.http
            .get<ApiResponse<PatientDTO[]> | PatientDTO[]>(`${this.baseUrl}/patient/userId/${userId}`)
            .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }

    createPatient(req: CreatePatientRequest): Observable<PatientDTO> {
        return this.http
            .post<ApiResponse<PatientDTO> | PatientDTO>(`${this.baseUrl}/patient/create`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    updatePatient(id: number, req: CreatePatientRequest): Observable<PatientDTO> {
        return this.http
            .put<ApiResponse<PatientDTO> | PatientDTO>(`${this.baseUrl}/patient/update/${id}`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    deletePatient(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/patient/delete/${id}`);
    }

    getAppointmentById(appointmentId: number): Observable<AppointmentDTO> {
        return this.http
            .get<ApiResponse<AppointmentDTO> | AppointmentDTO>(`${this.baseUrl}/appointment/id/${appointmentId}`)
            .pipe(map((r: any) => r.data ?? r));
    }

    getAppointmentsByPatient(patientId: number): Observable<AppointmentDTO[]> {
        return this.http
            .get<ApiResponse<AppointmentDTO[]>>(`${this.baseUrl}/appointment/patient/${patientId}`)
            .pipe(map(r => r.data ?? []));
    }

    createAppointment(req: CreateAppointmentRequest): Observable<AppointmentDTO> {
        return this.http
            .post<ApiResponse<AppointmentDTO> | AppointmentDTO>(`${this.baseUrl}/appointment/create`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    updateAppointment(id: number, req: CreateAppointmentRequest): Observable<AppointmentDTO> {
        return this.http
            .put<ApiResponse<AppointmentDTO> | AppointmentDTO>(`${this.baseUrl}/appointment/update/${id}`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    cancelAppointment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/appointment/delete/${id}`);
    }

    // getAppointmentsByDoctor(doctorId: number): Observable<AppointmentDTO[]> {
    //     return this.http
    //         .get<ApiResponse<AppointmentDTO[]> | AppointmentDTO[]>(`${this.baseUrl}/appointment/doctor/${doctorId}`)
    //         .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    // }
    getAppointmentsByDoctor(doctorId: number): Observable<AppointmentDTO[]> {
        return this.http
            .get<ApiResponse<AppointmentDTO[]> | AppointmentDTO[]>(`${this.baseUrl}/appointment/doctor/${doctorId}`)
            .pipe(map((r: any) => {
                const data = Array.isArray(r) ? r : (r.data ?? []);
                return Array.isArray(data) ? data : data ? [data] : [];
            }));
    }


    completeAppointment(id: number): Observable<AppointmentDTO> {
        return this.http
            .put<ApiResponse<AppointmentDTO> | AppointmentDTO>(`${this.baseUrl}/appointment/complete/${id}`, {})
            .pipe(map((r: any) => r.data ?? r));
    }
}