using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class CategoryEndpointTests(PostgresFixture pg)
{
    private static async Task<HttpClient> HouseholdClient(ApiFactory factory, string userId, string name)
    {
        var client = factory.CreateClientAs(userId, name: name);
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest($"{name}-House"));
        return client;
    }

    [Fact]
    public async Task List_returns_empty_when_no_categories()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-a", "A");

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");

        items.Should().BeEmpty();
    }
}
