import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MaquinaService } from '../services/maquina.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent {
  maquinaForm: FormGroup;
  iconeStatus: string = 'assets/icons/operando.svg';
  exibirModalCadastro: boolean = false;
  exibirModalLocalizacao: boolean = false;
  exibirModalErro: boolean = false;
  exibirModalErroLocalizacao: boolean = false;
  exibirModalErroDuplicidade:  boolean = false;
  exibirModalLatitudeLongitude: boolean = false;
  endereco: string = '';
  mensagemErro: string = '';

  constructor(
    private fb: FormBuilder,
    private maquinaService: MaquinaService,
    private router: Router
  ) {
    this.maquinaForm = this.fb.group({
      nome: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      localizacao: ['', Validators.required],
      status: ['', Validators.required]
    });

    this.atualizarIconeStatus();
  }

  atualizarIconeStatus() {
    const status = this.maquinaForm.value.status as 'operando' | 'parada' | 'desligada';
    const icones: Record<'operando' | 'parada' | 'desligada', string> = {
      operando: 'assets/icons/operando.svg',
      parada: 'assets/icons/parada.svg',
      desligada: 'assets/icons/desligada.svg'
    };

    this.iconeStatus = icones[status] ?? 'assets/icons/default.svg';
  }

  verificacaoCamposLocalizacao(): boolean {
    return (
      this.maquinaForm.value.localizacao?.trim() === '' &&
      this.maquinaForm.value.latitude?.trim() !== '' &&
      this.maquinaForm.value.longitude?.trim() !== ''
    );
  }


  confirmarCadastro() {
    if(this.verificacaoCamposLocalizacao()){
      this.exibirModalErroLocalizacao = true;
      return;
    }
    if (this.maquinaForm.invalid) {
      this.exibirModalErro = true;
      this.marcarCamposInvalidos();
      return;
    }

    const maquina = this.maquinaForm.value;

    this.maquinaService.cadastrarMaquina(maquina).subscribe(

      (maquinaCadastrada: any) => {
        const telemetria = {
          maquinaId: maquinaCadastrada.id,
          latitude: Number(this.maquinaForm.value.latitude),
          longitude: Number(this.maquinaForm.value.longitude),
          dataHora: new Date().toISOString(),
          status: this.maquinaForm.value.status
        };
        this.cadastrarTelemetria(telemetria);
        this.exibirModalCadastro = true; // Exibe modal de sucesso
      },
      (error) => {
        if (error.status === 409) { // HTTP 409 = Conflito (máquina já cadastrada)
          this.exibirModalErroDuplicidade = true; // Mostra modal de erro
          this.mensagemErro = "Essa máquina já foi cadastrada!";
        } else {
          console.error('Erro ao cadastrar máquina:', error);
          this.exibirModalErro = true;
          this.mensagemErro = "Erro ao cadastrar. Tente novamente!";
        }
      }
    ); 
  }

  cadastrarTelemetria(telemetria: any) {
    this.maquinaService.cadastrarTelemetria(telemetria).subscribe(
      () => {
        this.exibirModalCadastro = true;
      },
      (error) => {
        console.error('Erro ao cadastrar telemetria:', error);
        this.mensagemErro = 'Erro ao cadastrar telemetria. Verifique os dados.';
      }
    );
  }

  fecharModalErro() {
    this.exibirModalErro = false;
  }
  carregarMapa(lat: string, lon: string) {
    const mapElement = document.getElementById('mapa');
    if (mapElement) {
      mapElement.innerHTML = `<iframe width="100%" height="250px" frameborder="0"
        src="https://www.google.com/maps?q=${lat},${lon}&output=embed"></iframe>`;
    }
  }

  ExibirModalErroDuplicidade() {
    this.exibirModalErroDuplicidade = true;
  }

  fecharModalErroDuplicidade() {
    this.exibirModalErroDuplicidade = false;
  }

  ExibirModalErroLocalizacao() {
    this.exibirModalErroLocalizacao = true;
  }

  fecharModalErroLocalizacao() {
    this.exibirModalErroLocalizacao = false;
  }
  
  ExibirModalLatitudeLongitude() {
    this.exibirModalLatitudeLongitude = true;
  }

  fecharModalLatitudeLongitude() {
    this.exibirModalLatitudeLongitude = false;
  }
  fecharModalLocalizacao() {
    this.exibirModalLocalizacao = false;
  }
  
  limparCampos() {
    this.maquinaForm.patchValue({
      latitude: '',
      longitude: '',
      localizacao: ''
    });
    this.fecharModalLocalizacao();
  }

  marcarCamposInvalidos() {
    Object.keys(this.maquinaForm.controls).forEach(campo => {
      const controle = this.maquinaForm.get(campo);
      if (controle?.invalid) {
        const campoElement = document.getElementById(campo);
        if (campoElement) {
          campoElement.classList.add('campo-invalido', 'balanca');
          setTimeout(() => campoElement.classList.remove('balanca'), 500);
        }
      }
    });
  }

  buscarLocalizacao() {
    const { latitude, longitude } = this.maquinaForm.value;

    debugger
    if (!latitude || !longitude) {
      this.ExibirModalLatitudeLongitude();
      return;
    
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

    this.maquinaService.getLocalizacao(url).subscribe(
      (response) => {
        if (response?.display_name) {
          this.endereco = response.display_name;
          this.maquinaForm.patchValue({ localizacao: response.display_name });
          this.exibirModalLocalizacao = true;

        setTimeout(() => this.carregarMapa(latitude, longitude), 500);
        } else {
          this.ExibirModalLatitudeLongitude();
        }
      },
      () => {
        alert('Erro ao buscar localização.');
      }
    );
  }

  capturarLocalizacao() {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.maquinaForm.patchValue({ 
          latitude: position.coords.latitude.toFixed(6), 
          longitude: position.coords.longitude.toFixed(6) 
        });
        this.buscarLocalizacao();
      },
      () => {
        alert('Erro ao obter localização.');
      }
    );
  }

  continuarCadastro() {
    this.exibirModalCadastro = false;
    this.maquinaForm.reset({ status: 'operando' });
    this.atualizarIconeStatus();
  }

  voltarParaHome() {
    this.router.navigate(['/home']);
  }
}
