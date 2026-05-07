import { RoleName } from './role-name.enum';

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  enabled: boolean;
  roles: RoleName[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  roles: RoleName[];
}