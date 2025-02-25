using ConcertProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoramentoApi.Models;

[Route("api/[controller]")]
[ApiController]
public class HistoricoTelemetriaController : ControllerBase
{
    private readonly AppDbContext _context;

    public HistoricoTelemetriaController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IEnumerable<HistoricoTelemetria>>> GetTelemetriasPorMaquinaHistorico(Guid id)
    {
        var telemetrias = await _context.HistoricoTelemetria
            .Where(t => t.MaquinaId == id)
            .OrderByDescending(t => t.DataHora)
            .ToListAsync();

        if (!telemetrias.Any())
        {
            return NotFound("Nenhuma telemetria encontrada para essa máquina.");
        }

        return Ok(telemetrias);
    }

}
