using ConcertProject.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Adicionando o banco de dados com SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .WithOrigins("http://localhost:4200") // 🔥 Atualize para o seu frontend
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()); // 🔥 Isso permite credenciais, essencial para WebSocket!
});




// Adiciona serviços do SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<IServiceScopeFactory>(sp => sp.GetRequiredService<IServiceScopeFactory>());

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Aplicar migrações automaticamente
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseCors("AllowAll"); // 🔥 Adicionando a política CORS antes do SignalR
app.UseDeveloperExceptionPage();
app.UseRouting();
app.UseCors("CorsPolicy");
app.UseAuthorization();




app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<TelemetriaHub>("/telemetriaHub");  // 🔥 Certifique-se que está aqui!
});

app.Run();
