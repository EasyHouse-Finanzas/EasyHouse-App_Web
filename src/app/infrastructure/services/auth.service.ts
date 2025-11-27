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
  isAuthenticated = signal<boolean>(this.hasToken());
  currentUser = signal<UserSession | null>(this.getUserFromStorage());

  constructor(private http: HttpClient, private router: Router) {
    console.log(' AuthService inicializado. Usuario en storage:', this.currentUser());
  }
  get currentUserId(): string {
    const user = this.currentUser();
    return user?.id || '';
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(response => {
        console.log('📡 Respuesta Login Backend:', response);
        this.handleSuccess(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data).pipe(
      tap(response => {
        console.log('📡 Respuesta Registro Backend:', response);
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

  currentUserData(): UserSession | null {
    return this.currentUser();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUserFromStorage(): UserSession | null {
    const storedUser = localStorage.getItem(this.userKey);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  private parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error(' Error decodificando token:', e);
      return {};
    }
  }

  private handleSuccess(response: AuthResponse, userData?: { firstName: string, lastName: string, email: string }) {
    if (response && response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      this.isAuthenticated.set(true);

      const payload = this.parseJwt(response.token);
      console.log(' Token Decodificado:', payload);

      const firstName = userData?.firstName
        || response.firstName
        || payload.firstName
        || payload.given_name
        || payload.name
        || payload.unique_name
        || 'Usuario';

      const lastName = userData?.lastName
        || response.lastName
        || payload.lastName
        || payload.family_name
        || 'EasyHouse';

      const email = userData?.email
        || response.email
        || payload.email
        || payload.sub
        || '';

      const userId = response.id
        || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        || payload.sub
        || payload.id
        || '';

      const userSession: UserSession = {
        id: userId,
        name: `${firstName} ${lastName}`,
        email: email,
        initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      };

      console.log(' Guardando sesión de usuario:', userSession);

      localStorage.setItem(this.userKey, JSON.stringify(userSession));
      this.currentUser.set(userSession);
    }
  }
}
