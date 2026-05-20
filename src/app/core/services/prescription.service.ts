import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
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

    hasPrescription(appointmentId: number): Observable<boolean> {
        return this.getPrescriptionByAppointment(appointmentId).pipe(
            map(result => !!result),
            catchError((err) => {
                // 404 = no prescription, 500 = also treat as no prescription
                if (err?.status === 404 || err?.status === 500) {
                    return of(false);
                }
                return of(false);
            })
        );
    }

}
