import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private hubConnection!: signalR.HubConnection;

  private statusAtualizadoSource = new BehaviorSubject<{ id: string; status: string } | null>(null);
  statusAtualizado$ = this.statusAtualizadoSource.asObservable();

  private localizacaoAtualizadaSource = new BehaviorSubject<{ id: string; latitude: number; longitude: number } | null>(null);
  localizacaoAtualizada$ = this.localizacaoAtualizadaSource.asObservable();

  constructor() {
    this.startConnection();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5188/telemetriaHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ WebSocket Conectado!'))
      .catch((err) => console.error('❌ Erro WebSocket:', err));

    this.hubConnection.on('ReceberAtualizacaoLocalizacao', (id: string, latitude: number, longitude: number) => {
      console.log(`📡 Atualização recebida para máquina ${id}: ${latitude}, ${longitude}`);
      this.localizacaoAtualizadaSource.next({ id, latitude, longitude });
    });
    
    this.hubConnection.on('ReceberAtualizacaoStatus', (id: string, status: string) => {
      console.log(`🔴 Máquina ${id} mudou status para ${status}`);
      this.statusAtualizadoSource.next({ id, status });
    });
  }
}
