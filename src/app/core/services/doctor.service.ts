import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    DoctorDTO,
    DoctorSlotDTO,
    ApiResponse
} from '../models/index';

@Injectable({ providedIn: 'root' })
export class DoctorService {
    private http = inject(HttpClient);
    private doctorUrl = `${environment.apiGatewayUrl}/doctors`;
    private slotUrl = `${environment.apiGatewayUrl}/doctor-slot`;

    getAllDoctors(): Observable<DoctorDTO[]> {
        return this.http
            .get<DoctorDTO[]>(`${this.doctorUrl}/all`)

    }

    getDoctorById(id: number): Observable<DoctorDTO> {
        return this.http
            .get<DoctorDTO>(`${this.doctorUrl}/check/${id}`)

    }

    getSlotsByDoctor(doctorId: number): Observable<DoctorSlotDTO[]> {
        return this.http
            .get<ApiResponse<DoctorSlotDTO[]> | DoctorSlotDTO[]>(`${this.slotUrl}/doctor/${doctorId}`)
            .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }

    getSlotById(slotId: number): Observable<DoctorSlotDTO> {
        return this.http
            .get<ApiResponse<DoctorSlotDTO> | DoctorSlotDTO>(`${this.slotUrl}/${slotId}`)
            .pipe(map((r: any) => r.data ?? r));
    }
}