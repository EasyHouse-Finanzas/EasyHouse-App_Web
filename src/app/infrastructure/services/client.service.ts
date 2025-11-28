import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Client } from '../../domain/models/client.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor() {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  createClient(client: Client): Observable<any> {
    const currentUserId = this.authService.currentUserData()?.id || this.getUserIdFromToken();

    const payload = {
      firstName: client.firstName,
      lastName: client.lastName,
      birthDate: client.birthDate,
      documentNumber: client.documentNumber,
      occupation: client.occupation,
      monthlyIncome: client.monthlyIncome,
      userId: currentUserId
    };

    return this.http.post(this.apiUrl, payload);
  }

  updateClient(id: string, client: any): Observable<any> {
    const payload = {
      firstName: client.firstName,
      lastName: client.lastName,
      birthDate: client.birthDate,
      documentNumber: client.documentNumber,
      occupation: client.occupation,
      monthlyIncome: client.monthlyIncome
    };
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private getUserIdFromToken(): string {
    const token = this.authService.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
    } catch {
      return '';
    }
  }
}
