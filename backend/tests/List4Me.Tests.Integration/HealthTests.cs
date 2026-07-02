using System.Net;
using FluentAssertions;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class HealthTests(PostgresFixture pg)
{
    [Fact]
    public async Task Health_returns_ok()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClient();

        var resp = await client.GetAsync("/health");

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
