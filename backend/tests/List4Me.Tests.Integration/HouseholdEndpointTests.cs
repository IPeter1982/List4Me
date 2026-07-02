using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Households;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class HouseholdEndpointTests(PostgresFixture pg)
{
    [Fact]
    public async Task Create_household_returns_201_and_makes_user_owner()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClientAs("auth0|alice", "alice@example.com", "Alice");

        var resp = await client.PostAsJsonAsync("/api/households",
            new CreateHouseholdRequest("Alice's Home"));

        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var dto = await resp.Content.ReadFromJsonAsync<HouseholdDto>();
        dto!.Name.Should().Be("Alice's Home");
        dto.Members.Should().ContainSingle();
        dto.Members[0].Role.Should().Be("Owner");
        dto.Members[0].DisplayName.Should().Be("Alice");
    }

    [Fact]
    public async Task Create_household_when_user_already_has_one_returns_409()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClientAs("auth0|bob", "bob@example.com", "Bob");
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("First"));

        var resp = await client.PostAsJsonAsync("/api/households",
            new CreateHouseholdRequest("Second"));

        resp.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}
