import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { RealEstate } from '../../domain/models/real-estate.model';

@Injectable({
  providedIn: 'root'
})
export class RealEstateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/houses`;

  getHouses(): Observable<RealEstate[]> {
    return this.http.get<RealEstate[]>(this.apiUrl);
  }

  createHouse(house: RealEstate): Observable<any> {
    return this.http.post(this.apiUrl, house);
  }

  deleteHouse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
