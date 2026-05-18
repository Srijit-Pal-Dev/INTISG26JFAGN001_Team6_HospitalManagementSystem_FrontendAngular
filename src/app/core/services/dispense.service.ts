import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, forkJoin } from 'rxjs';
import { CreateDispenseRequest, DispenseGroup } from '../models/dispense.model';
import { DispenseRequestResponse } from '../models/medicine.model';
// import { PHARMACY_API_URL } from '../config/pharmacy-api.config';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DispenseService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  // private readonly base = `${PHARMACY_API_URL}/dispense`;  
  private readonly base = `${environment.apiGatewayUrl}/dispense`;

  private get pharmacistHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Role': this.auth.getRole() ?? 'PHARMACIST' });
  }

  private get doctorHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Role': 'DOCTOR' });
  }

  create(payload: CreateDispenseRequest): Observable<string> {
    const clean: CreateDispenseRequest = {
      prescriptionId: payload.prescriptionId,
      patientId: payload.patientId,
      appointmentId: payload.appointmentId,
      medicines: payload.medicines.map(m => ({ medicineId: m.medicineId, quantity: m.quantity }))
    };
    return this.http.post(this.base, clean, { headers: this.doctorHeaders, responseType: 'text' });
  }

  getPending(): Observable<DispenseRequestResponse[]> {
    return this.http.get<DispenseRequestResponse[]>(`${this.base}/pending`, { headers: this.pharmacistHeaders });
  }

  getPendingGrouped(): Observable<DispenseGroup[]> {
    return this.getPending().pipe(
      map(items => {
        const groupMap = new Map<number, DispenseGroup>();
        for (const item of items) {
          const key = item.prescriptionId;
          if (!groupMap.has(key)) {
            groupMap.set(key, {
              patientId: item.patientId,
              prescriptionId: item.prescriptionId,
              appointmentId: item.appointmentId,
              items: [],
              totalPrice: 0
            });
          }
          const group = groupMap.get(key)!;
          group.items.push(item);
          group.totalPrice += Number(item.totalPrice ?? 0);
        }
        return Array.from(groupMap.values());
      })
    );
  }

  dispense(id: number): Observable<DispenseRequestResponse> {
    return this.http.put<DispenseRequestResponse>(`${this.base}/${id}`, {}, { headers: this.pharmacistHeaders });
  }

  dispenseGroup(group: DispenseGroup): Observable<DispenseRequestResponse[]> {
    return forkJoin(group.items.map(i => this.dispense(i.id)));
  }

  update(prescriptionId: number, payload: CreateDispenseRequest): Observable<DispenseRequestResponse[]> {
    return this.http.put<DispenseRequestResponse[]>(
      `${this.base}/prescription/${prescriptionId}`,
      {
        prescriptionId: payload.prescriptionId,
        patientId: payload.patientId,
        appointmentId: payload.appointmentId,
        medicines: payload.medicines.map(m => ({ medicineId: m.medicineId, quantity: m.quantity }))
      },
      { headers: this.pharmacistHeaders }
    );
  }
}
