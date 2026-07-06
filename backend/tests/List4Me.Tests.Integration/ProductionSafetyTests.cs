using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Data;
using List4Me.Tests.Integration.Fixtures;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace List4Me.Tests.Integration;

/// <summary>
/// Boots the API in Production env and confirms /api/test/* is unreachable.
/// This proves the E2E fixtures cannot leak into a real prod deploy.
/// </summary>
public class ProdApiFactory(PostgresFixture pg) : WebApplicationFactory<Program>
{
    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.UseEnvironment("Production");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(pg.ConnectionString));
        });
        var host = base.CreateHost(builder);
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureDeleted();
        db.Database.Migrate();
        return host;
    }
}

[Collection("Postgres")]
public class ProductionSafetyTests(PostgresFixture pg)
{
    [Fact]
    public async Task TestReset_is_404_in_Production_env()
    {
        await using var factory = new ProdApiFactory(pg);
        var client = factory.CreateClient();
        var res = await client.PostAsync("/api/test/reset", null);
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task TestLoginAs_is_404_in_Production_env()
    {
        await using var factory = new ProdApiFactory(pg);
        var client = factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/test/login-as",
            new { auth0UserId = "auth0|x", email = (string?)null, name = "X" });
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
