import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    DoctorDTO,
    DoctorSlotDTO,
    CreateDoctorProfileRequest,
    CreateDoctorSlotRequest,
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
            .pipe(map((r: any) => Array.isArray(r) ? r : (r.data ?? [])));
    }

    getDoctorById(id: number): Observable<DoctorDTO> {
        return this.http
            .get<ApiResponse<DoctorDTO> | DoctorDTO>(`${this.doctorUrl}/check/${id}`)
            .pipe(map((r: any) => r.data ?? r));
    }

    createDoctorProfile(req: CreateDoctorProfileRequest): Observable<DoctorDTO> {
        return this.http
            .post<ApiResponse<DoctorDTO> | DoctorDTO>(`${this.doctorUrl}/profile/create`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    updateDoctorProfile(userId: number, req: CreateDoctorProfileRequest): Observable<DoctorDTO> {
        return this.http
            .put<ApiResponse<DoctorDTO> | DoctorDTO>(`${this.doctorUrl}/profile/update/${userId}`, req)
            .pipe(map((r: any) => r.data ?? r));
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

    createSlot(req: CreateDoctorSlotRequest): Observable<DoctorSlotDTO> {
        return this.http
            .post<ApiResponse<DoctorSlotDTO> | DoctorSlotDTO>(`${this.slotUrl}/create`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    createManySlots(
        doctorId: number,
        slotDate: string,
        startTime: string,
        numberOfSlots: number,
        slotMinutes: number,
        booked: boolean = false
    ): Observable<DoctorSlotDTO[]> {
        const params = { doctorId, slotDate, startTime, numberOfSlots, slotMinutes };
        return this.http
            .post<ApiResponse<DoctorSlotDTO[]> | DoctorSlotDTO[]>(`${this.slotUrl}/create-many`, null, { params: params as any })
            .pipe(map((r: any) => {
                const slots: DoctorSlotDTO[] = Array.isArray(r) ? r : (r.data ?? []);
                return booked ? slots.map(s => ({ ...s, booked: true })) : slots;
            }));
    }

    updateSlot(id: number, req: CreateDoctorSlotRequest): Observable<DoctorSlotDTO> {
        return this.http
            .put<ApiResponse<DoctorSlotDTO> | DoctorSlotDTO>(`${this.slotUrl}/update/${id}`, req)
            .pipe(map((r: any) => r.data ?? r));
    }

    deleteSlot(id: number): Observable<void> {
        return this.http.delete<void>(`${this.slotUrl}/delete/${id}`);
    }
}