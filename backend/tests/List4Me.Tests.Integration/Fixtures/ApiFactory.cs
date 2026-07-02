using List4Me.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace List4Me.Tests.Integration.Fixtures;

public class ApiFactory(PostgresFixture pg) : WebApplicationFactory<Program>
{
    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.UseEnvironment("Test");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(pg.ConnectionString));

            services.PostConfigureAll<AuthenticationOptions>(o =>
            {
                o.DefaultAuthenticateScheme = FakeJwtAuthHandler.SchemeName;
                o.DefaultChallengeScheme = FakeJwtAuthHandler.SchemeName;
            });
            services.AddAuthentication(FakeJwtAuthHandler.SchemeName)
                .AddScheme<FakeAuthOptions, FakeJwtAuthHandler>(FakeJwtAuthHandler.SchemeName, _ => { });
        });

        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureDeleted();
        db.Database.Migrate();

        return host;
    }

    public HttpClient CreateClientAs(string auth0UserId, string? email = null, string? name = null)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(FakeJwtAuthHandler.UserHeader, auth0UserId);
        if (email is not null) client.DefaultRequestHeaders.Add(FakeJwtAuthHandler.EmailHeader, email);
        if (name is not null) client.DefaultRequestHeaders.Add(FakeJwtAuthHandler.NameHeader, name);
        return client;
    }
}
