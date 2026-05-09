import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    DispenseRequestResponse,
    ApiResponse
} from '../models/index';

@Injectable({ providedIn: 'root' })
export class MedicineService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiGatewayUrl}/medicines`;

    getMedicinesByAppointment(appointmentId: number): Observable<DispenseRequestResponse[]> {
        return this.http
            .get<DispenseRequestResponse[]>(`${this.baseUrl}/appointment/${appointmentId}`)
    }
}