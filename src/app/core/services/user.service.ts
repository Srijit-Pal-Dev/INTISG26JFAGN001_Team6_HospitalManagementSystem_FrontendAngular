// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { UserResponse, CreateUserRequest } from '../models/index';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {

//   private baseUrl = `${environment.apiGatewayUrl}/users`;

//   private get adminHeaders(): HttpHeaders {
//     const token = localStorage.getItem('accessToken');
//     return new HttpHeaders({
//       'Authorization': `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBob3NwaXRhbC5jb20iLCJ1c2VySWQiOjEsInJvbGVzIjpbIkFETUlOIiwiRkFDVE9SX1BBU1NXT1JEIl0sImlhdCI6MTc3ODEyNDE0MiwiZXhwIjoxNzc4MjEwNTQyfQ._0RHb23kAc7JegZ2R6OiDNJbaft6ETu-NPwCrfaU4zkwTjx4vISJTHviFsiwL_5aTpwkvmFqoyh54Gdvl73m3g`
//     });
//   }

//   constructor(private http: HttpClient) {}

//   createUser(request: CreateUserRequest): Observable<UserResponse> {
//     return this.http.post<UserResponse>(
//       `${this.baseUrl}/create`,
//       request,
//       { headers: this.adminHeaders }
//     );
//   }

//   getAllUsers(): Observable<UserResponse[]> {
//     return this.http.get<UserResponse[]>(
//       `${this.baseUrl}/all`,
//       { headers: this.adminHeaders }
//     );
//   }

//   getUserById(id: number): Observable<UserResponse> {
//     return this.http.get<UserResponse>(
//       `${this.baseUrl}/id/${id}`,
//       { headers: this.adminHeaders }
//     );
//   }

//   getUserByUsername(username: string): Observable<UserResponse> {
//     return this.http.get<UserResponse>(
//       `${this.baseUrl}/username/${username}`,
//       { headers: this.adminHeaders }
//     );
//   }

//   deleteUser(id: number): Observable<string> {
//     return this.http.delete<string>(
//       `${this.baseUrl}/delete/${id}`,
//       {
//         headers: this.adminHeaders,
//         responseType: 'text' as 'json'
//       }
//     );
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse, CreateUserRequest } from '../models/index';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${environment.apiGatewayUrl}/users`;

  constructor(private http: HttpClient) {}

  // POST /users/create
  createUser(request: CreateUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.baseUrl}/create`,
      request
    );
  }

  // GET /users/all
  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(
      `${this.baseUrl}/all`
    );
  }

  // GET /users/id/{id}
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.baseUrl}/id/${id}`
    );
  }

  // GET /users/username/{username}
  getUserByUsername(username: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.baseUrl}/username/${username}`
    );
  }

  // DELETE /users/delete/{id}
  deleteUser(id: number): Observable<string> {
    return this.http.delete<string>(
      `${this.baseUrl}/delete/${id}`,
      { responseType: 'text' as 'json' }
    );
  }
}