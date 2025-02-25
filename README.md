Monitoramento de Máquinas
📌 Sobre o Projeto
Este projeto é uma plataforma de monitoramento de máquinas, que permite:

📊 Dashboard em Tempo Real: Acompanhe o status das máquinas com WebSockets (SignalR).
📍 Localização das Máquinas: Veja a movimentação simulada em um mapa interativo.
🛠️ Cadastro de Equipamentos: Adicione e gerencie suas máquinas.
📄 Histórico de Telemetria: Consulte movimentações anteriores.
✅ Tecnologias Utilizadas:

🌐 Backend: .NET Core (C#) + Entity Framework + SignalR
🎨 Frontend: Angular + TypeScript + Bootstrap
📦 Banco de Dados: SQL Server


🚀 Como Rodar o Projeto Localmente
1️⃣ Clonar o Repositório
git clone https://github.com/RodrigoYukio/ProjectConcert.git
cd ProjectConcert

2️⃣ Configurar o Backend (.NET Core)
1 Acesse a pasta do backend:
cd back

2 Restaurar pacotes necessários:
dotnet restore

3 Criar o banco de dados automaticamente:
dotnet ef database update

4 Rodar a API:
dotnet run

📌 A API estará disponível em http://localhost:5188.


3️⃣ Configurar o Frontend (Angular)
1 Acesse a pasta do frontend:
cd ../front

2 Instalar dependências do Angular:
npm install

3 Rodar o Angular:
ng serve --open

📌 O frontend estará disponível em http://localhost:4200.

📂 Estrutura do Projeto
📂 Backend (.NET Core)

Controllers/ → API REST para gerenciar máquinas e telemetria.
Hubs/ → Comunicação em tempo real com SignalR.
Models/ → Modelos de dados.
📂 Frontend (Angular)

src/app/components/ → Componentes da interface.
src/app/services/ → Serviços que consomem a API.
📂 Banco de Dados (SQL Server)

Telemetrias → Informações de monitoramento.
HistoricoTelemetria → Histórico de movimentação.
Maquinas → Cadastro de equipamentos.

