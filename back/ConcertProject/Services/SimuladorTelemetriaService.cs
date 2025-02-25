
using ConcertProject.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ConcertProject.Services
{
    public class SimuladorTelemetriaService : IHostedService, IDisposable
    {
        private readonly IHubContext<TelemetriaHub> _hubContext;
        private Timer _timer;

        public SimuladorTelemetriaService(IHubContext<TelemetriaHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            // Configura o timer para enviar dados de telemetria a cada 5 segundos
            //_timer = new Timer(EnviarTelemetria, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            return Task.CompletedTask;
        }

        private async void EnviarTelemetria(object state)
        {
            // Simulação de uma máquina e seus dados de telemetria
            var maquinaId = "291A4EB4-096C-4225-B25D-F054774D8951"; // ID fictício da máquina
            var latitude = 23.5505; // Coordenada de exemplo (São Paulo)
            var longitude = -46.6333; // Coordenada de exemplo (São Paulo)
            var status = "operando"; // Status fictício

            // Enviar os dados via SignalR para todos os clientes conectados
            await _hubContext.Clients.All.SendAsync("ReceberTelemetria", maquinaId, latitude, longitude, status);
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Change(Timeout.Infinite, 0); // Para a execução do timer
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
