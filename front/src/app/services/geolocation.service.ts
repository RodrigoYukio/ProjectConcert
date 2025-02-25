import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private apiUrl = 'https://nominatim.openstreetmap.org/reverse?format=json';

  constructor(private http: HttpClient) {}

  getAddress(latitude: number, longitude: number): Observable<string> {
    const url = `${this.apiUrl}&lat=${latitude}&lon=${longitude}`;
    return this.http.get<any>(url).pipe(
      map(response => response.display_name || 'Localização desconhecida')
    );
  }
}
