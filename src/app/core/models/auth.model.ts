export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// export interface AuthResponse {
//   accessToken: string;
//   refreshToken: string;
// }

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  fullName: string;
  roles: string;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
}