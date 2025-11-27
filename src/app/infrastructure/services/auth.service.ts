import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { LoginRequest, RegisterRequest, AuthResponse, UserSession } from '../../domain/models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/iam/auth`;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Signals para manejar el estado reactivo
  isAuthenticated = signal<boolean>(this.hasToken());
  // Signal del usuario: se inicializa leyendo del localStorage
  currentUser = signal<UserSession | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(response => this.handleSuccess(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data).pipe(
      tap(response => {
        // En registro, tenemos los datos frescos del formulario, así que los pasamos manualmente
        // para asegurarnos de que se guarden aunque el backend solo devuelva el token.
        this.handleSuccess(response, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        });
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUserFromStorage(): UserSession | null {
    const storedUser = localStorage.getItem(this.userKey);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  // Método unificado para manejar el éxito del login/registro
  // Acepta datos extra (userData) para forzar el guardado del nombre desde el registro
  private handleSuccess(response: AuthResponse, userData?: { firstName: string, lastName: string, email: string }) {
    if (response && response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      this.isAuthenticated.set(true);

      // Prioridad: 1. Datos pasados manualmente (registro) -> 2. Datos del backend -> 3. Fallback
      const firstName = userData?.firstName || response.firstName || 'Usuario';
      const lastName = userData?.lastName || response.lastName || 'EasyHouse';
      const email = userData?.email || response.email || '';

      const userSession: UserSession = {
        name: `${firstName} ${lastName}`,
        email: email,
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      };

      // Guardamos sesión persistente y actualizamos la señal
      localStorage.setItem(this.userKey, JSON.stringify(userSession));
      this.currentUser.set(userSession);
    }
  }
}
