using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Households;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class HouseholdIsolationTests(PostgresFixture pg)
{
    [Fact]
    public async Task UserA_and_UserB_have_isolated_households()
    {
        await using var factory = new ApiFactory(pg);
        var alice = factory.CreateClientAs("auth0|iso-alice", name: "Alice");
        var bob = factory.CreateClientAs("auth0|iso-bob", name: "Bob");

        await alice.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("A-House"));
        await bob.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("B-House"));

        var aHouse = await alice.GetFromJsonAsync<HouseholdDto>("/api/households/me");
        var bHouse = await bob.GetFromJsonAsync<HouseholdDto>("/api/households/me");

        aHouse!.Name.Should().Be("A-House");
        bHouse!.Name.Should().Be("B-House");
        aHouse.Id.Should().NotBe(bHouse.Id);
    }

    [Fact]
    public async Task Unauthenticated_request_returns_401()
    {
        await using var factory = new ApiFactory(pg);
        var anonymous = factory.CreateClient();
        var resp = await anonymous.GetAsync("/api/households/me");
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
