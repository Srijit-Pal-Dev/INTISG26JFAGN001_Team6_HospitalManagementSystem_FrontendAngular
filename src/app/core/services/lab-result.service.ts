import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    LabResultResponse,
    ApiResponse
} from '../models/index';

@Injectable({ providedIn: 'root' })
export class LabResultService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiGatewayUrl}/lab-tests`;

    getResultsByPatient(patientId: number): Observable<LabResultResponse[]> {
        return this.http
            .get<ApiResponse<LabResultResponse[]> | LabResultResponse[]>(
                `${this.baseUrl}/patient/${patientId}/results`
            )
            .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }

    getTestsByAppointment(appointmentId: number): Observable<any[]> {
        return this.http
            .get<any>(`${this.baseUrl}/appointment/tests/${appointmentId}`)
            .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }
}