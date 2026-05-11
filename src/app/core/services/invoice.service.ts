import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceDTO, PaymentDTO, PaymentMethod, ApiResponse } from '../models/index';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
    private http = inject(HttpClient);
    private invoiceUrl = `${environment.apiGatewayUrl}/invoice`;
    private paymentUrl = `${environment.apiGatewayUrl}/payment`;

    getInvoicesByPatient(patientId: number): Observable<InvoiceDTO[]> {
        return this.http
            .get<ApiResponse<InvoiceDTO[]>>(`${this.invoiceUrl}/patient/${patientId}`)
            .pipe(map(r => r.data ?? []));
    }

    getInvoiceById(invoiceId: number): Observable<InvoiceDTO> {
        return this.http
            .get<ApiResponse<InvoiceDTO>>(`${this.invoiceUrl}/id/${invoiceId}`)
            .pipe(map(r => r.data));
    }

    initiatePayment(invoiceId: number): Observable<PaymentDTO> {
        return this.http
            .post<ApiResponse<PaymentDTO>>(`${this.paymentUrl}/initiate/${invoiceId}`, {})
            .pipe(map(r => r.data));
    }

    completePayment(paymentId: number, paymentMethod: PaymentMethod): Observable<PaymentDTO> {
        const params = new HttpParams().set('paymentMethod', paymentMethod);
        return this.http
            .put<ApiResponse<PaymentDTO>>(`${this.paymentUrl}/complete/${paymentId}`, {}, { params })
            .pipe(map(r => r.data));
    }

    cancelPayment(paymentId: number): Observable<PaymentDTO> {
        return this.http
            .put<ApiResponse<PaymentDTO>>(`${this.paymentUrl}/cancel/${paymentId}`, {})
            .pipe(map(r => r.data));
    }

    getPaymentByInvoice(invoiceId: number): Observable<PaymentDTO> {
        return this.http
            .get<ApiResponse<PaymentDTO>>(`${this.paymentUrl}/invoice/${invoiceId}`)
            .pipe(map(r => r.data));
    }
}