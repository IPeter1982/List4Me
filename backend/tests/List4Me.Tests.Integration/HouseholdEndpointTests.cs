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

    [Fact]
    public async Task GetMe_without_household_returns_404()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClientAs("auth0|charlie");
        var resp = await client.GetAsync("/api/households/me");
        resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetMe_returns_household_with_members()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClientAs("auth0|dana", name: "Dana");
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("Dana Home"));

        var resp = await client.GetAsync("/api/households/me");

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await resp.Content.ReadFromJsonAsync<HouseholdDto>();
        dto!.Name.Should().Be("Dana Home");
        dto.Members.Should().ContainSingle(m => m.DisplayName == "Dana");
    }

    [Fact]
    public async Task Update_household_name_by_owner_succeeds()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClientAs("auth0|eve", name: "Eve");
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("Old"));

        var resp = await client.PatchAsJsonAsync("/api/households/me",
            new UpdateHouseholdRequest("New"));

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var get = await client.GetFromJsonAsync<HouseholdDto>("/api/households/me");
        get!.Name.Should().Be("New");
    }
}
