using System.ComponentModel.DataAnnotations;

namespace ConcertProject.Models
{
    public class HistoricoTelemetria
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid MaquinaId { get; set; }  // Identificador da máquina associada
        public double Latitude { get; set; }  // Coordenada de latitude
        public double Longitude { get; set; }  // Coordenada de longitude
        public DateTime DataHora { get; set; }  // Data e hora da atualização de telemetria
    }
}
