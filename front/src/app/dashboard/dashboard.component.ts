import { Component,  OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { MaquinaService } from '../services/maquina.service';
import { GeolocationService } from '../services/geolocation.service';
import { WebSocketService } from '../services/web-socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  maquinas: any[] = [];

  constructor(
    private maquinaService: MaquinaService,
    private geoService: GeolocationService,
    private wsService: WebSocketService,
    private router: Router 
  ) {}

  ngOnInit() {
    this.carregarMaquinas();
  
    this.wsService.statusAtualizado$.subscribe((data: any) => {
      if (data) {
        console.log(`🔄 Atualizando status da máquina ${data.id} para ${data.status}`);
        const maquinaAtualizada = this.maquinas.find(m => m.id === data.id);
        if (maquinaAtualizada) {
          maquinaAtualizada.status = data.status;
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

  irParaGrid() {
    this.router.navigate(['/grid']);
  }
  carregarMaquinas() {
    this.maquinaService.getMaquinas().subscribe(
      (data) => {
        this.maquinas = data.map(maquina => ({
          ...maquina,
          localizacaoAtual: 'Carregando...',
          estado: 'Carregando...'
        }));

        this.maquinas.forEach(maquina => {
          this.carregarTelemetria(maquina.id);
        });

        console.log('📊 Máquinas carregadas:', this.maquinas);
      },
      (error) => {
        console.error('❌ Erro ao buscar máquinas:', error);
      }
    );
  }

  carregarTelemetria(maquinaId: string) {
    this.maquinaService.getTelemetria(maquinaId).subscribe(
        (telemetrias) => {
            if (telemetrias.length > 0) {
                const ultimaTelemetria = telemetrias[0];

                this.geoService.getAddress(ultimaTelemetria.latitude, ultimaTelemetria.longitude).subscribe(
                    (address) => {
                        const maquinaAtualizada = this.maquinas.find(m => m.id === maquinaId);
                        if (maquinaAtualizada) {
                            maquinaAtualizada.localizacaoAtual = address;
                            maquinaAtualizada.estado = this.extrairEstado(address);
                            maquinaAtualizada.ultimaTelemetria = ultimaTelemetria; 
                        }
                    },
                    (error) => {
                        console.error('❌ Erro ao buscar localização da telemetria:', error);
                    }
                );
            }
        },
        (error) => {
            console.error('❌ Erro ao carregar histórico de telemetria:', error);
        }
    );
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

  get maquinasParadasPorTempo(): { tempo: string, quantidade: number }[] {
    const contagem = { '1h': 0, '2h': 0, '3h': 0, 'Mais de 4h': 0 };

    this.maquinas.forEach(maquina => {
        if (maquina.status === 'parada' && maquina.ultimaTelemetria) {
            const ultimaData = new Date(maquina.ultimaTelemetria.dataHora).getTime();
            const agora = new Date().getTime();
            const diferencaHoras = Math.floor((agora - ultimaData) / 3600000);

            if (diferencaHoras >= 4) contagem['Mais de 4h']++;
            else if (diferencaHoras >= 3) contagem['3h']++;
            else if (diferencaHoras >= 2) contagem['2h']++;
            else if (diferencaHoras >= 1) contagem['1h']++;
        }
    });

    const totalParadas = Object.values(contagem).reduce((a, b) => a + b, 0);

    if (totalParadas === 0) {
        return [{ tempo: 'Nenhuma máquina parada neste invervalo de tempo.', quantidade: 1 }];
    }

    return [
        { tempo: '1h', quantidade: contagem['1h'] },
        { tempo: '2h', quantidade: contagem['2h'] },
        { tempo: '3h', quantidade: contagem['3h'] },
        { tempo: 'Mais de 4h', quantidade: contagem['Mais de 4h'] }
    ];
}

  get estadosComQuantidade(): { nome: string, quantidade: number }[] {
    const contagemEstados: { [key: string]: number } = {};

    this.maquinas.forEach(maquina => {
      if (maquina.estado) {
        contagemEstados[maquina.estado] = (contagemEstados[maquina.estado] || 0) + 1;
      }
    });

    return Object.keys(contagemEstados).map(estado => ({
      nome: estado,
      quantidade: contagemEstados[estado]
    }));
  }

  get totalMaquinas(): number {
    return this.maquinas.length;
  }

  get maquinasOperando(): number {
    return this.maquinas.filter(m => m.status === 'operando').length;
  }

  get maquinasDesligadas(): number {
    return this.maquinas.filter(m => m.status === 'desligada').length;
  }

  get maquinasParadaEmManutencao(): number {
    return this.maquinas.filter(m => m.status === 'parada').length;
  }

  atualizarGraficos() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const estados = this.estadosComQuantidade.map(e => e.nome);
        const quantidades = this.estadosComQuantidade.map(e => e.quantidade);

        new Chart(document.getElementById("tempoParadaChart") as HTMLCanvasElement, {
            type: 'doughnut',
            data: {
                labels: this.maquinasParadasPorTempo.map(p => p.tempo),
                datasets: [{
                    data: this.maquinasParadasPorTempo.map(p => p.quantidade),
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0']
                }]
            }
        });

        if (estados.length > 0 && estados[0] !== 'Nenhum estado registrado') {
            new Chart(document.getElementById("estadoMaquinasChart") as HTMLCanvasElement, {
                type: 'bar',
                data: {
                    labels: estados,
                    datasets: [{
                        label: estados.length === 1 ? estados[0] : estados.join(', '),
                        data: quantidades,
                        backgroundColor: '#ff9f40'
                    }]
                }
            });
        } else {
            console.log('⚠️ Nenhum estado válido para exibir no gráfico.');
        }
    }
  }
}
