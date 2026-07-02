using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) =>
{
    cfg.MinimumLevel.Information()
       .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
       .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
       .Enrich.FromLogContext();

    if (ctx.HostingEnvironment.IsDevelopment())
        cfg.WriteTo.Console();
    else
        cfg.WriteTo.Console(new Serilog.Formatting.Compact.CompactJsonFormatter());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

public partial class Program { }
