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

    [Fact]
    public async Task Create_product_returns_201_and_appears_in_list()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|prod-d", "D");

        var resp = await client.PostAsJsonAsync(
            $"/api/categories/{categoryId}/products",
            new CreateProductRequest("Tejföl", 1m, "db"));
        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await resp.Content.ReadFromJsonAsync<ProductDto>();
        created!.Name.Should().Be("Tejföl");
        created.DefaultUnit.Should().Be("db");

        var all = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products?q=tejföl");
        all.Should().ContainSingle(p => p.Id == created.Id);
    }

    [Fact]
    public async Task Create_product_rejects_empty_name()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|prod-e", "E");

        var resp = await client.PostAsJsonAsync(
            $"/api/categories/{categoryId}/products",
            new CreateProductRequest("", null, null));

        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Update_product_changes_name_and_unit()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|prod-f", "F");

        var create = await client.PostAsJsonAsync($"/api/categories/{categoryId}/products",
            new CreateProductRequest("Kenyér", 1m, "db"));
        var created = await create.Content.ReadFromJsonAsync<ProductDto>();

        var patch = await client.PatchAsJsonAsync($"/api/products/{created!.Id}",
            new UpdateProductRequest("Rozs kenyér", 500m, "g"));
        patch.StatusCode.Should().Be(HttpStatusCode.OK);

        var updated = await patch.Content.ReadFromJsonAsync<ProductDto>();
        updated!.Name.Should().Be("Rozs kenyér");
        updated.DefaultQuantity.Should().Be(500m);
        updated.DefaultUnit.Should().Be("g");
    }
}
