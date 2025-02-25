using ConcertProject.Hubs;
using ConcertProject.Models;
using ConcertProject.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MonitoramentoApi.Models;

[Route("api/[controller]")]
[ApiController]
public class TelemetriasController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<TelemetriaHub> _hubContext;

    public TelemetriasController(AppDbContext context, IHubContext<TelemetriaHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost("cadastro")]
    public async Task<IActionResult> CadastrarTelemetria([FromBody] Telemetria telemetria)
    {
        var maquina = await _context.Maquinas.FindAsync(telemetria.MaquinaId);
        if (maquina == null)
        {
            return NotFound("Máquina não encontrada.");
        }

        telemetria.DataHora = telemetria.DataHora.AddHours(-3);

        _context.Telemetrias.Add(telemetria);
        await _context.SaveChangesAsync();

        //tabela pra manter o histórico de telemeria
        var historico = new HistoricoTelemetria
        {
            MaquinaId = telemetria.MaquinaId,
            DataHora = telemetria.DataHora,
            Latitude = telemetria.Latitude,
            Longitude = telemetria.Longitude
        };

        _context.HistoricoTelemetria.Add(historico);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTelemetriasPorMaquina), new { id = telemetria.MaquinaId }, telemetria);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IEnumerable<Telemetria>>> GetTelemetriasPorMaquina(Guid id)
    {
        var telemetrias = await _context.Telemetrias
            .Where(t => t.MaquinaId == id)
            .OrderByDescending(t => t.DataHora)
            .ToListAsync();

        if (!telemetrias.Any())
        {
            return NotFound("Nenhuma telemetria encontrada para essa máquina.");
        }

        return Ok(telemetrias);
    }

    [HttpGet("{id}/historico")]
    public async Task<ActionResult<IEnumerable<HistoricoTelemetria>>> GetTelemetriasPorMaquinaHistorico(Guid id)
    {
        var historico = await _context.HistoricoTelemetria
            .Where(h => h.MaquinaId == id)
            .OrderByDescending(h => h.DataHora)
            .ToListAsync();

        if (!historico.Any())
        {
            return NotFound("Nenhum histórico encontrado para essa máquina.");
        }

        return Ok(historico);
    }

    [HttpPut("{id}/atualizar-telemetria")]
    public async Task<IActionResult> AtualizarTelemetria(Guid id, [FromBody] AtualizarTelemetriaDto dados)
    {
        var telemetria = await _context.Telemetrias.FirstOrDefaultAsync(t => t.MaquinaId == id);
        if (telemetria == null)
            return NotFound("Máquina não encontrada.");

        // Atualizar os dados de telemetria
        telemetria.DataHora = DateTime.Now;
        telemetria.Latitude = dados.Latitude;
        telemetria.Longitude = dados.Longitude;

        _context.Telemetrias.Update(telemetria);
        await _context.SaveChangesAsync();

        //tabela pra manter o histórico de telemeria
        var historico = new HistoricoTelemetria
        {
            MaquinaId = id,
            DataHora = DateTime.Now,
            Latitude = dados.Latitude,
            Longitude = dados.Longitude
        };

        _context.HistoricoTelemetria.Add(historico);
        await _context.SaveChangesAsync();

        // Enviar atualização via WebSocket
        await _hubContext.Clients.All.SendAsync("ReceberAtualizacaoLocalizacao", id.ToString(), dados.Latitude, dados.Longitude);

        return Ok(telemetria);
    }
}
