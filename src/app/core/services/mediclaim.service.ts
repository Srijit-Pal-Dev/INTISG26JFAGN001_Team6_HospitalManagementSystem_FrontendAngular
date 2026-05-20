import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MediclaimDTO, MediclaimStatus, ApiResponse } from '../models/index';

@Injectable({ providedIn: 'root' })
export class MediclaimService {
    private http = inject(HttpClient);
    private mediclaimUrl = `${environment.apiGatewayUrl}/mediclaim`;

    createMediclaim(dto: MediclaimDTO): Observable<MediclaimDTO> {
        return this.http
            .post<ApiResponse<MediclaimDTO>>(`${this.mediclaimUrl}/process`, dto)
            .pipe(map(r => r.data));
    }

     getAllMediclaims(): Observable<MediclaimDTO[]> {
    return this.http.get<any>(`${this.mediclaimUrl}/all`)
      .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }

    getMediclaimsByStatus(status: MediclaimStatus): Observable<MediclaimDTO[]> {
        return this.http.get<any>(`${this.mediclaimUrl}/status/${status}`)
        .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }

    getMediclaimById(id: number): Observable<MediclaimDTO> {
        return this.http.get<any>(`${this.mediclaimUrl}/id/${id}`)
        .pipe(map((r: any) => r.data ?? r));
    }

    getMediclaimsByPatient(patientId: number): Observable<MediclaimDTO[]> {
        return this.http.get<any>(`${this.mediclaimUrl}/patient/${patientId}`)
        .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }

    updateMediclaimStatus(id: number, status: MediclaimStatus): Observable<MediclaimDTO> {
        return this.http.put<any>(`${this.mediclaimUrl}/update/${id}?status=${status}`, {})
        .pipe(map((r: any) => r.data ?? r));
    }

    
}