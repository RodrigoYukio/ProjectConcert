using ConcertProject.Models;

namespace MonitoramentoApi.Models
{
    public class Maquina
    {
        public Guid Id { get; set; }  // Identificador único (UUID)
        public string Nome { get; set; }  // Nome da máquina
        public string Localizacao { get; set; }  // Localização ou nome do local
        public string Status { get; set; }  // Status da máquina (operando, parada para manutenção, desligada)

        public ICollection<Telemetria>? Telemetrias { get; set; } = new List<Telemetria>();
    }
}