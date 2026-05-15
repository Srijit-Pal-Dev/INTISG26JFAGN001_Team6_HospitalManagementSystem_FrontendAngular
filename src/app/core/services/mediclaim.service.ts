import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MediclaimDTO, ApiResponse } from '../models/index';

@Injectable({ providedIn: 'root' })
export class MediclaimService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiGatewayUrl}/mediclaim`;

    createMediclaim(dto: MediclaimDTO): Observable<MediclaimDTO> {
        return this.http
            .post<ApiResponse<MediclaimDTO>>(`${this.baseUrl}/process`, dto)
            .pipe(map(r => r.data));
    }

    getMediclaimsByPatient(patientId: number): Observable<MediclaimDTO[]> {
        return this.http
            .get<ApiResponse<MediclaimDTO[]>>(`${this.baseUrl}/patient/${patientId}`)
            .pipe(map(r => r.data ?? []));
    }

    getMediclaimById(id: number): Observable<MediclaimDTO> {
        return this.http
            .get<ApiResponse<MediclaimDTO>>(`${this.baseUrl}/id/${id}`)
            .pipe(map(r => r.data));
    }
}