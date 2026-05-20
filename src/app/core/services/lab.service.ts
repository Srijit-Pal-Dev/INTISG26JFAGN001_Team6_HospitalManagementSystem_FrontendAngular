import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LabService {

  private baseUrl = `${environment.apiGatewayUrl}/lab-tests`;

  constructor(private http: HttpClient) {}

  // 1. GET ALL LAB TESTS (all statuses) — used by lab dashboard
  getAllTests(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/all`)
      .pipe(map(res => res?.data ?? []));
  }

  // 2. GET PENDING LAB TESTS only
  getPendingTests(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/pending`)
      .pipe(map(res => res?.data ?? []));
  }

  // 3. CREATE LAB TEST (Doctor/Admin)
  createLabTest(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, request);
  }

  // 4. COLLECT SAMPLE — PENDING → SAMPLE_COLLECTED
  collectSample(labTestId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${labTestId}/collect`, {})
      .pipe(map(res => res?.data ?? null));
  }

  // 5. START TEST — SAMPLE_COLLECTED → IN_PROGRESS
  // assignedTo is the logged-in technician's username
  startTest(labTestId: number, assignedTo: string): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/${labTestId}/start?assignedTo=${assignedTo}`, {}
    ).pipe(map(res => res?.data ?? null));
  }

  // 6. UPLOAD RESULT — IN_PROGRESS → COMPLETED
  uploadResult(labTestId: number, result: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${labTestId}/result`, result)
      .pipe(map(res => res?.data ?? null));
  }

  // 7. GET RESULT BY TEST ID
  getResultByTestId(labTestId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${labTestId}/results`)
      .pipe(map(res => res?.data ?? null));
  }

  // 8. GET RESULTS BY PATIENT ID
  getResultsByPatientId(patientId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/patient/${patientId}/results`)
      .pipe(map(res => res?.data ?? []));
  }

  // 9. GET TESTS BY APPOINTMENT ID
  getTestsByAppointmentId(appointmentId: number): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/appointment/tests/${appointmentId}`)
      .pipe(map(res => res?.data ?? []));
  }
}
