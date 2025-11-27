import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CreateConfigCommand } from '../../domain/models/simulation.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/configs`;

  createConfig(config: CreateConfigCommand): Observable<any> {
    return this.http.post(this.apiUrl, config);
  }
}
