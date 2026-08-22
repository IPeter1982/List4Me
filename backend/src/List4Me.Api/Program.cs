using System.Text;
using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Health;
using List4Me.Api.Features.Households;
using List4Me.Api.Features.Lists;
using List4Me.Api.Features.Products;
using List4Me.Api.Features.Templates;
using List4Me.Api.Features.TestOnly;
using List4Me.Api.Realtime;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

var connectionString = builder.Configuration.GetConnectionString("Default");
if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    var host = uri.Host;
    var requiresSsl = !host.EndsWith(".railway.internal", StringComparison.OrdinalIgnoreCase);
    var sslSuffix = requiresSsl ? ";SSL Mode=Require;Trust Server Certificate=true" : "";
    connectionString = $"Host={host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])}{sslSuffix}";
    builder.Configuration["ConnectionStrings:Default"] = connectionString;
    Console.WriteLine($"[startup] Normalized URI-format DATABASE_URL: host={host} port={uri.Port} db={uri.AbsolutePath.TrimStart('/')} ssl={requiresSsl}");
}
else if (!string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("[startup] Using DATABASE_URL as key=value connection string (not URI-shaped)");
}
else
{
    Console.WriteLine("[startup] WARNING: ConnectionStrings__Default is empty or unset");
}

builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(connectionString));

var auth0Domain = builder.Configuration["Auth0:Domain"];
var auth0Audience = builder.Configuration["Auth0:Audience"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{auth0Domain}/";
        options.Audience = auth0Audience;
        options.TokenValidationParameters = new()
        {
            NameClaimType = "name",
            RoleClaimType = "https://list4me/roles"
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

if (builder.Environment.EnvironmentName == "Test")
{
    var testKeyMaterial = builder.Configuration["Test:SigningKey"]
        ?? "test-signing-key-must-be-at-least-32-bytes-long!!";
    var testKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(testKeyMaterial));
    builder.Services.PostConfigure<JwtBearerOptions>(
        JwtBearerDefaults.AuthenticationScheme,
        options =>
        {
            options.Authority = null;
            options.MetadataAddress = null!;
            options.Audience = TestLoginAsHandler.TestAudience;
            options.TokenValidationParameters = new()
            {
                ValidateIssuer = false,
                ValidateAudience = true,
                ValidAudience = TestLoginAsHandler.TestAudience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = testKey,
                NameClaimType = "name",
                RoleClaimType = "https://list4me/roles"
            };
        });
}

builder.Services.AddAuthorization();
builder.Services.AddScoped<HouseholdContext>();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddSignalR();
builder.Services.AddScoped<IRealtimeNotifier, RealtimeNotifier>();

var allowedOrigin = builder.Configuration["AllowedOrigin"] ?? "http://localhost:5173";
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(allowedOrigin)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<HouseholdContextMiddleware>();

app.MapHealth();
app.MapHouseholds();
app.MapInvites();
app.MapCategories();
app.MapProducts();
app.MapLists();
app.MapTemplates();

app.MapHub<HouseholdHub>("/hubs/household").RequireAuthorization();

if (app.Environment.EnvironmentName is "Test" or "Development")
{
    app.MapTestEndpoints();
}

app.Run();

public partial class Program { }
