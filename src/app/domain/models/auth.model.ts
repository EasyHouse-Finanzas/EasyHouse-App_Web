export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  number: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  initials: string;
}
