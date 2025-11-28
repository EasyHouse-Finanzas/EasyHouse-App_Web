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
    const payload = {
      proyecto: house.project,
      codigoInmueble: house.propertyCode,
      areaTotal: house.totalArea,
      areaTechada: house.builtArea,
      ubicacion: house.location,
      precio: house.price
    };

    return this.http.post(this.apiUrl, payload);
  }

  deleteHouse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateHouse(id: string, house: RealEstate): Observable<any> {
    const payload = {
      project: house.project,
      propertyCode: house.propertyCode,
      totalArea: house.totalArea,
      builtArea: house.builtArea,
      location: house.location,
      price: house.price
    };
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }
}
