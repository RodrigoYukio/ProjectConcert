import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MaquinaService } from '../services/maquina.service';

@Component({
  selector: 'app-detalhes-modal',
  standalone: true,
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.css'],
  imports: [CommonModule],
})
export class DetalhesComponent implements OnInit {
  dadosMaquina: any = {};
  historicoTelemetria: any[] = [];
  mostrarHistorico = false;
  exibirModalMapa = false;

  constructor(
    private route: ActivatedRoute,
    private maquinaService: MaquinaService,
    private router: Router
  ) {}


  ngOnInit() {
    const maquinaId = this.route.snapshot.paramMap.get('id');
    if (maquinaId) {
      this.carregarDetalhes(maquinaId);
    }
  }

  carregarDetalhes(id: string) {
    this.maquinaService.getMaquina(id).subscribe(
      (data) => {
        this.dadosMaquina = {
          id: data.id,
          nome: data.nome,
          status: data.status,
          localizacao: data.localizacao,
        };
      },
      (error) => {
        console.error('Erro ao carregar detalhes da máquina:', error);
      }
    );
  }

  carregarHistorico() {
    debugger;
    if (!this.mostrarHistorico) {
      const maquinaId = this.dadosMaquina.id;
      this.maquinaService.getTelemetriasHistorico(maquinaId).subscribe(
        (telemetrias) => {
          this.historicoTelemetria = telemetrias.map((t: any) => ({
            local: `${t.latitude}, ${t.longitude}`,
            dataHora: new Date(t.dataHora).toLocaleString(),
          }));
          this.mostrarHistorico = true;
        },
        (error) => {
          console.error('Erro ao carregar histórico de telemetria:', error);
        }
      );
    } else {
      this.mostrarHistorico = false;
    }
  }

  exibirMapa() {
    this.exibirModalMapa = true;
  }

  fecharMapa() {
    this.exibirModalMapa = false;
  }

  fecharModal() {
    this.router.navigate(['/grid']);
  }

  getIconeStatus(status: string) {
    const icones: any = {
      operando: '/assets/icons/operando.svg',
      parada: '/assets/icons/parada.svg',
      desligada: '/assets/icons/desligada.svg',
    };
    return icones[status] || '/assets/icons/default.svg';
  }
}
