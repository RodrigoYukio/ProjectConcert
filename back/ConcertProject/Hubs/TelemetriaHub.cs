using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ConcertProject.Models;
using Microsoft.Extensions.DependencyInjection;
using MonitoramentoApi.Models;

namespace ConcertProject.Hubs
{
    public class TelemetriaHub : Hub
    {
        private static readonly Random random = new();
        private static Timer? _timerMovimentacao;
        private static Timer? _timerStatus;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<TelemetriaHub> _hubContext;

        public TelemetriaHub(IServiceScopeFactory scopeFactory, IHubContext<TelemetriaHub> hubContext)
        {
            _scopeFactory = scopeFactory;
            _hubContext = hubContext;

            if (_timerMovimentacao == null)
            {
                _timerMovimentacao = new Timer(async _ => await AtualizarMovimentacao(), null, 0, 30000);
            }

            if (_timerStatus == null)
            {
                _timerStatus = new Timer(async _ => await VerificarStatusMaquinas(), null, 0, 60000);
            }
        }

        private async Task VerificarStatusMaquinas()
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var maquinas = await _context.Maquinas.ToListAsync();

                if (!maquinas.Any())
                {
                    Console.WriteLine("Nenhuma máquina encontrada para verificação de status.");
                    return;
                }

                foreach (var maquina in maquinas)
                {
                    var ultimaTelemetria = await _context.HistoricoTelemetria
                        .Where(t => t.MaquinaId == maquina.Id)
                        .OrderByDescending(t => t.DataHora)
                        .FirstOrDefaultAsync();

                    string novoStatus = maquina.Status;

                    // Se a máquina não tiver sido atualizada nos últimos 1 minutos, eu defino ela como parada
                    if (ultimaTelemetria == null || (DateTime.Now - ultimaTelemetria.DataHora) > TimeSpan.FromMinutes(1))
                    {
                        novoStatus = "parada";
                    }

                    // Atualiza o status no banco antes de enviar via WebSocket
                    await EnviarAtualizacaoStatus(maquina.Id.ToString(), novoStatus);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao verificar status das máquinas: {ex.Message}");
            }
        }

        public async Task EnviarAtualizacaoStatus(string id, string status)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                Guid maquinaId = Guid.Parse(id);

                var maquina = await _context.Maquinas.FirstOrDefaultAsync(m => m.Id == maquinaId);
                if (maquina == null)
                {
                    Console.WriteLine($"Máquina {maquinaId} não encontrada no banco.");
                    return;
                }


                if (maquina.Status != status)
                {
                    maquina.Status = status;
                    _context.Maquinas.Update(maquina);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Status atualizado no banco: Máquina {maquinaId} -> {status}");
                }

                // Envia atualização via WebSocket
                await _hubContext.Clients.All.SendAsync("ReceberAtualizacaoStatus", id, status);
                Console.WriteLine($"Status enviado para os clientes: Máquina {maquinaId} -> {status}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao atualizar e enviar status: {ex.Message}");
            }
        }

        private async Task AtualizarMovimentacao()
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var _context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var maquinaAleatoria = await _context.Maquinas
                    .OrderBy(m => Guid.NewGuid())
                    .FirstOrDefaultAsync();

                if (maquinaAleatoria == null)
                {
                    Console.WriteLine("Nenhuma máquina encontrada para atualização.");
                    return;
                }

                var ultimaTelemetria = await _context.HistoricoTelemetria
                    .Where(t => t.MaquinaId == maquinaAleatoria.Id)
                    .OrderByDescending(t => t.DataHora)
                    .FirstOrDefaultAsync();

                if (ultimaTelemetria == null)
                {
                    Console.WriteLine($"Nenhuma telemetria encontrada para a máquina {maquinaAleatoria.Id}.");
                    return;
                }

                //  máquina estiver "parada" eu não atualizo
                if (maquinaAleatoria.Status == "parada")
                {
                    Console.WriteLine($"Máquina {maquinaAleatoria.Id} está parada. Não será atualizada.");
                    return;
                }

                double novaLatitude = ultimaTelemetria.Latitude + (0.0001 * (random.NextDouble() * 2 - 1));
                double novaLongitude = ultimaTelemetria.Longitude + (0.0001 * (random.NextDouble() * 2 - 1));
                string novoStatus = "operando";

                var novaTelemetria = new HistoricoTelemetria
                {
                    MaquinaId = maquinaAleatoria.Id,
                    Latitude = novaLatitude,
                    Longitude = novaLongitude,
                    DataHora = DateTime.Now
                };

                _context.HistoricoTelemetria.Add(novaTelemetria);
                await _context.SaveChangesAsync();

                // Atualiza o status no banco antes de enviar via WebSocket
                await EnviarAtualizacaoStatus(maquinaAleatoria.Id.ToString(), novoStatus);

                await _hubContext.Clients.All.SendAsync("ReceberAtualizacaoLocalizacao", maquinaAleatoria.Id.ToString(), novaLatitude, novaLongitude);
                Console.WriteLine($"Localização atualizada: Máquina {maquinaAleatoria.Id} -> {novaLatitude}, {novaLongitude}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao atualizar movimentação: {ex.Message}");
            }
        }
    }
}
