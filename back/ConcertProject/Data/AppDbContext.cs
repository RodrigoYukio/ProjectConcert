using ConcertProject.Models;
using Microsoft.EntityFrameworkCore;
using MonitoramentoApi.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Maquina> Maquinas { get; set; }
    public DbSet<Telemetria> Telemetrias { get; set; }
    public DbSet<HistoricoTelemetria> HistoricoTelemetria { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<HistoricoTelemetria>()
            .HasKey(h => h.Id);
    }
}