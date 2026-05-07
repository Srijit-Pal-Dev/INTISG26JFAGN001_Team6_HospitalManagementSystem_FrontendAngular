// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import {
//   LoginRequest,
//   RegisterRequest,
//   RefreshTokenRequest,
//   LogoutRequest,
//   AuthResponse
// } from '../models/index';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private baseUrl = `${environment.apiGatewayUrl}/auth`;

//   constructor(private http: HttpClient) {}

//   login(request: LoginRequest): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(
//       `${this.baseUrl}/login`,
//       request
//     );
//   }

//   register(request: RegisterRequest): Observable<{ message: string }> {
//     return this.http.post<{ message: string }>(
//       `${this.baseUrl}/register`,
//       request
//     );
//   }

//   refreshToken(request: RefreshTokenRequest): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(
//       `${this.baseUrl}/refresh`,
//       request
//     );
//   }

//   logout(request: LogoutRequest): Observable<{ message: string }> {
//     return this.http.post<{ message: string }>(
//       `${this.baseUrl}/logout`,
//       request
//     );
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  AuthResponse
} from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiGatewayUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/login`,
      request
    ).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      })
    );
  }

  register(request: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/register`,
      request
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/refresh`,
      { refreshToken }
    ).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      })
    );
  }


  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}