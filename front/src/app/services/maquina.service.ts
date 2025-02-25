import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class MaquinaService {
  private apiUrlMaquinas = 'http://localhost:5188/api/maquinas';
  private apiUrlTelemetria = 'http://localhost:5188/api/telemetrias';
  private apiUrlHistoricoTelemetria = 'http://localhost:5188/api/historicotelemetria';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  getMaquinas(): Observable<any[]> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<any[]>(this.apiUrlMaquinas);
    } else {
      return of([]);
    }
  }

  getMaquina(id: string): Observable<any> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<any>(`${this.apiUrlMaquinas}/${id}`);
    } else {
      return of(null);
    }
  }

  getTelemetriasHistorico(id: string): Observable<any[]> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<any[]>(`${this.apiUrlHistoricoTelemetria}/${id}`);
    } else {
      return of([]);
    }
  }

  getTelemetria(id: string): Observable<any[]> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<any[]>(`${this.apiUrlTelemetria}/${id}`);
    } else {
      return of([]);
    }
  }

  cadastrarMaquina(maquina: any): Observable<any> {
    return this.http.post(`${this.apiUrlMaquinas}/cadastro`, maquina);
  }

  cadastrarTelemetria(telemetria: any): Observable<any> {
    return this.http.post(`${this.apiUrlTelemetria}/cadastro`, telemetria);
  }

  getLocalizacao(apiUrlMaquinas: string): Observable<any> {
    return this.http.get(apiUrlMaquinas);
  }
}
