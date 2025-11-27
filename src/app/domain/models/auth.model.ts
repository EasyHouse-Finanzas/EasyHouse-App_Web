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
  firstName?: string; // Nuevo
  lastName?: string;  // Nuevo
}

// Interfaz para guardar en el estado local
export interface UserSession {
  name: string;
  email: string;
  initials: string;
}
