using MonitoramentoApi.Models;

namespace ConcertProject.Models
{
    public class Telemetria
    {
        public Guid Id { get; set; }  // Identificador único (UUID)
        public Guid MaquinaId { get; set; }  // Identificador da máquina associada
        public double Latitude { get; set; }  // Coordenada de latitude
        public double Longitude { get; set; }  // Coordenada de longitude
        public DateTime DataHora { get; set; }  // Data e hora da atualização de telemetria
    }
}
