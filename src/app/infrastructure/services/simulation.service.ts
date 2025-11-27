import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CreateSimulationCommand } from '../../domain/models/simulation.model';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/simulations`;

  createSimulation(simulation: CreateSimulationCommand): Observable<any> {
    return this.http.post(this.apiUrl, simulation);
  }

  getSimulations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getSimulationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
