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

    [Fact]
    public async Task Create_top_level_category_returns_201_and_appears_in_list()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-b", "B");

        var resp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Bevásárlás", "shopping-cart", null, "Megvettem"));
        resp.StatusCode.Should().Be(HttpStatusCode.Created);

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        items.Should().ContainSingle(c => c.Name == "Bevásárlás");
        items![0].CompletedLabel.Should().Be("Megvettem");
    }

    [Fact]
    public async Task Create_subcategory_nests_under_parent()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-c", "C");

        var parentResp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Bevásárlás", "shopping-cart", null, null));
        var parent = await parentResp.Content.ReadFromJsonAsync<CategoryDto>();

        var childResp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Pékáru", "cookie", parent!.Id, null));
        childResp.StatusCode.Should().Be(HttpStatusCode.Created);

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        items!.Should().ContainSingle();
        items[0].Subcategories.Should().ContainSingle(s => s.Name == "Pékáru");
    }

    [Fact]
    public async Task Create_second_level_subcategory_rejected()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-d", "D");
        var parent = await (await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("P", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();
        var child = await (await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("C", "cookie", parent!.Id, null))).Content.ReadFromJsonAsync<CategoryDto>();

        var resp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("GC", "apple", child!.Id, null));

        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_with_invalid_icon_returns_400()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-e", "E");

        var resp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("X", "not-a-real-icon", null, null));

        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
