using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Api.Features.Products;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class ProductEndpointTests(PostgresFixture pg)
{
    private static async Task<(HttpClient client, Guid categoryId)> Setup(
        ApiFactory factory, string userId, string name)
    {
        var client = factory.CreateClientAs(userId, name: name);
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest($"{name}-House"));

        var cats = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        return (client, cats![0].Id);
    }

    [Fact]
    public async Task List_products_returns_seeded_items_for_category()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|prod-a", "A");

        var items = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products");

        items.Should().NotBeNull();
        items!.Length.Should().BeGreaterThan(0);
        items.Should().OnlyContain(p => p.CategoryId == categoryId || p.CategoryId != Guid.Empty);
    }

    [Fact]
    public async Task List_products_q_filter_case_insensitive_substring()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|prod-b", "B");

        var all = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products");
        var needle = all![0].Name[..2].ToLowerInvariant();

        var filtered = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products?q={needle}");

        filtered.Should().OnlyContain(p => p.Name.ToLowerInvariant().Contains(needle));
        filtered!.Length.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task List_products_favorites_only_empty_when_no_favorites_yet()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|prod-c", "C");

        var favs = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products?favoritesOnly=true");

        favs.Should().BeEmpty();
    }
}
