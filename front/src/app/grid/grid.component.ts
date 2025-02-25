import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketService } from '../services/web-socket.service';
import { MaquinaService } from '../services/maquina.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { GeolocationService } from '../services/geolocation.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class GridComponent implements OnInit {
  maquinas: any[] = [];
  maquinasFiltradas: any[] = [];
  filtroNome: string = '';
  filtroStatus: string = '';
  filtroEstado: string = '';

  constructor(
    private router: Router,
    private wsService: WebSocketService,
    private maquinaService: MaquinaService,
    private geoService: GeolocationService 
  ) {}

  ngOnInit() {
    this.carregarMaquinas();
  
    this.wsService.statusAtualizado$.subscribe((data: any) => {
      if (data) {
        console.log(`🔄 Atualizando status da máquina ${data.id} para ${data.status}`);
        const maquinaAtualizada = this.maquinas.find(m => m.id === data.id);
        if (maquinaAtualizada) {
          maquinaAtualizada.status = data.status;
          this.aplicarFiltros();
        }
      }
    });
  
    this.wsService.localizacaoAtualizada$.subscribe((data: any) => {
      if (data) {
        console.log(`📍 Atualizando localização da máquina ${data.id}`);
        const maquinaAtualizada = this.maquinas.find(m => m.id === data.id);
        if (maquinaAtualizada) {
          this.geoService.getAddress(data.latitude, data.longitude).subscribe(
            (address) => {
              maquinaAtualizada.localizacaoAtual = address;
              console.log(`🏠 Endereço atualizado: ${address}`);
            },
            (error) => {
              console.error('Erro ao buscar localização:', error);
              maquinaAtualizada.localizacaoAtual = 'Erro ao buscar localização';
            }
          );
        }
      }
    });
  }
  voltarParaHome() {
    this.router.navigate(['/home']);
  }
  
  carregarTelemetria(maquinaId: string) {
    this.maquinaService.getTelemetriasHistorico(maquinaId).subscribe(
      (telemetrias) => {
        if (telemetrias.length > 0) {

          const ultimaTelemetria = telemetrias[0];
  
          this.geoService.getAddress(ultimaTelemetria.latitude, ultimaTelemetria.longitude).subscribe(
            (address) => {
              const maquinaAtualizada = this.maquinas.find(m => m.id === maquinaId);
              if (maquinaAtualizada) {
                maquinaAtualizada.localizacaoAtual = address;
              }
            },
            (error) => {
              console.error('Erro ao buscar localização da telemetria:', error);
            }
          );
        }
      },
      (error) => {
        console.error('Erro ao carregar histórico de telemetria:', error);
      }
    );
  }
  carregarMaquinas() {
    debugger
    this.maquinaService.getMaquinas().subscribe(
      (data) => {
        this.maquinas = data.map(maquina => ({
          ...maquina,
          localizacaoAtual: 'Carregando...' 
        }));
  
        this.maquinas.forEach(maquina => {
          this.carregarTelemetria(maquina.id);
        });
  
        this.aplicarFiltros();
      },
      (error) => {
        console.error('Erro ao buscar máquinas:', error);
      }
    );
  }
  

  atualizarFiltroNome(event: Event) {
    this.filtroNome = (event.target as HTMLInputElement).value.toLowerCase();
    this.aplicarFiltros();
  }

  atualizarFiltroStatus(event: Event) {
    this.filtroStatus = (event.target as HTMLSelectElement).value;
    this.aplicarFiltros();
  }

  atualizarFiltroEstado(estado: string) {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.maquinasFiltradas = this.maquinas.filter(maquina => {
      const nomeMatch = maquina.nome.toLowerCase().includes(this.filtroNome);
      const statusMatch = this.filtroStatus ? maquina.status === this.filtroStatus : true;
  

      const estadoMaquina = this.extrairEstado(maquina.localizacaoAtual);
      const estadoMatch = this.filtroEstado ? estadoMaquina === this.filtroEstado : true;
  
      return nomeMatch && statusMatch && estadoMatch;
    });
  }

  extrairEstado(localizacao: string): string {
    if (!localizacao) return 'Desconhecido';
  

    const partes = localizacao.split(',').map(part => part.trim());
  

    for (let i = partes.length - 1; i >= 0; i--) {
      if (/^\d{5}-\d{3}$/.test(partes[i]) && i > 1) {
        return partes[i - 2]; 
      }
    }
  
    return 'Desconhecido';
  }
  
  estadosUnicos() {
    return [...new Set(this.maquinas.map(m => this.extrairEstado(m.localizacaoAtual)))].filter(estado => estado !== 'Desconhecido');
  }

  getStatusIcon(status: 'operando' | 'parada' | 'desligada'): string {
    const icons = {
      operando: 'assets/icons/operando.svg',
      parada: 'assets/icons/parada.svg',
      desligada: 'assets/icons/desligada.svg'
    };
    return icons[status] ?? 'assets/icons/default.svg';
  }

  getRowClass(status: string) {
    return {
      'operando': status === 'operando',
      'parada': status === 'parada',
      'desligada': status === 'desligada'
    };
  }

verDetalhes(id: string) {
  this.router.navigate(['/detalhes', id]);
}

  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }
}
