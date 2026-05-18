import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine, MedicineRequest, DispenseRequestResponse } from '../models/index';
// import { PHARMACY_API_URL } from '../config/pharmacy-api.config';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface PharmacyDTO {
  medicineId: number;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  // private readonly base = `${PHARMACY_API_URL}/medicines`;
  private readonly base = `${environment.apiGatewayUrl}/medicines`;

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Role': this.auth.getRole() ?? 'PHARMACIST' });
  }

  getAll(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.base, { headers: this.headers });
  }

  getById(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.base}/${id}`, { headers: this.headers });
  }

  search(name: string): Observable<Medicine[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Medicine[]>(`${this.base}/search`, { headers: this.headers, params });
  }

  getMedicinesByAppointmentId(appointmentId: number): Observable<PharmacyDTO[]> {
    return this.http.get<PharmacyDTO[]>(`${this.base}/appointment/${appointmentId}`, { headers: this.headers });
  }

  getMedicinesByAppointment(appointmentId: number): Observable<DispenseRequestResponse[]> {
    return this.http.get<DispenseRequestResponse[]>(`${this.base}/appointment/${appointmentId}`, { headers: this.headers });
  }

  create(payload: MedicineRequest): Observable<Medicine> {
    return this.http.post<Medicine>(`${this.base}/create`, payload, { headers: this.headers });
  }

  update(id: number, payload: MedicineRequest): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.base}/update/${id}`, payload, { headers: this.headers });
  }
}
