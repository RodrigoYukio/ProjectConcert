
using ConcertProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MonitoramentoApi.Models;
using Microsoft.AspNetCore.SignalR;
using ConcertProject.Hubs;


[Route("api/[controller]")]
[ApiController]
public class MaquinasController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<TelemetriaHub> _hubContext;

    public MaquinasController(AppDbContext context, IHubContext<TelemetriaHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Maquina>>> GetMaquinas()
    {
        var maquinas = await _context.Maquinas.ToListAsync();
        if (!maquinas.Any())
        {
            return NotFound("Nenhuma máquina encontrada.");
        }
        return Ok(maquinas);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Maquina>> GetMaquina(Guid id)
    {
        var maquina = await _context.Maquinas
            .Include(m => m.Telemetrias)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (maquina == null)
        {
            return NotFound("Máquina não encontrada.");
        }

        return Ok(maquina);
    }

    [HttpPost("cadastro")]
    public async Task<IActionResult> CadastrarMaquina([FromBody] Maquina maquina)
    {
        if (maquina == null)
        {
            return BadRequest("Os dados da máquina são inválidos.");
        }

        var maquinaExistente = await _context.Maquinas
            .FirstOrDefaultAsync(m => m.Nome == maquina.Nome && m.Localizacao == maquina.Localizacao);

        if (maquinaExistente != null)
        {
            return Conflict("Já existe uma máquina cadastrada com esse nome e localização.");
        }

        maquina.Id = Guid.NewGuid();
        _context.Maquinas.Add(maquina);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMaquina), new { id = maquina.Id }, maquina);
    }

    [HttpPut("{id}/atualizar-status")]
    public async Task<IActionResult> AtualizarStatus(Guid id, [FromBody] string novoStatus)
    {
        var maquina = await _context.Maquinas.FindAsync(id);
        if (maquina == null)
            return NotFound("Máquina não encontrada.");

        maquina.Status = novoStatus;
        _context.Maquinas.Update(maquina);
        await _context.SaveChangesAsync();

        // 🚀 Enviar atualização via WebSocket
        await _hubContext.Clients.All.SendAsync("ReceberAtualizacaoStatus", id.ToString(), novoStatus);

        return Ok(maquina);
    }
}
