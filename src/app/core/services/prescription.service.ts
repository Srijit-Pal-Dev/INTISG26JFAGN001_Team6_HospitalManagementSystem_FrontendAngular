import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    CreatePrescriptionRequest,
    PrescriptionResponse,
    ApiResponse
} from '../models/index';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiGatewayUrl}/prescriptions`;

    createPrescription(req: CreatePrescriptionRequest): Observable<PrescriptionResponse> {
        return this.http
            .post<ApiResponse<PrescriptionResponse> | PrescriptionResponse>(`${this.baseUrl}/create`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    getPrescriptionById(id: number): Observable<PrescriptionResponse> {
        return this.http
            .get<ApiResponse<PrescriptionResponse> | PrescriptionResponse>(`${this.baseUrl}/${id}`)
            .pipe(map((r: any) => r.data ?? r));
    }

    getPrescriptionByAppointment(appointmentId: number): Observable<PrescriptionResponse> {
        return this.http
            .get<ApiResponse<PrescriptionResponse> | PrescriptionResponse>(`${this.baseUrl}/appointment/${appointmentId}`)
            .pipe(map((r: any) => r.data ?? r));
    }
}
