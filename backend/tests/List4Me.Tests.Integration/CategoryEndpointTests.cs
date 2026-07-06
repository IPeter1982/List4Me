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

    private static async Task ClearCategories(HttpClient client)
    {
        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        foreach (var c in items!)
            await client.DeleteAsync($"/api/categories/{c.Id}?force=true");
    }

    [Fact]
    public async Task List_returns_empty_when_no_categories()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-a", "A");
        await ClearCategories(client);

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");

        items.Should().BeEmpty();
    }

    [Fact]
    public async Task Create_top_level_category_returns_201_and_appears_in_list()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-b", "B");
        await ClearCategories(client);

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
        await ClearCategories(client);

        var parentResp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Bevásárlás", "shopping-cart", null, null));
        var parent = await parentResp.Content.ReadFromJsonAsync<CategoryDto>();

        var childResp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Pékáru", "cookie", parent!.Id, null));
        childResp.StatusCode.Should().Be(HttpStatusCode.Created);

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        items!.Should().ContainSingle();
        items![0].Subcategories.Should().ContainSingle(s => s.Name == "Pékáru");
    }

    [Fact]
    public async Task Create_second_level_subcategory_rejected()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-d", "D");
        await ClearCategories(client);
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
        await ClearCategories(client);

        var resp = await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("X", "not-a-real-icon", null, null));

        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Update_category_changes_name_and_icon_and_label()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-u", "U");
        await ClearCategories(client);
        var created = await (await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Old", "shopping-cart", null, "K"))).Content.ReadFromJsonAsync<CategoryDto>();

        var resp = await client.PatchAsJsonAsync($"/api/categories/{created!.Id}",
            new UpdateCategoryRequest("New", "apple", "Megvettem", 5));
        resp.StatusCode.Should().Be(HttpStatusCode.OK);

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        items.Should().ContainSingle();
        items![0].Name.Should().Be("New");
        items[0].IconKey.Should().Be("apple");
        items[0].CompletedLabel.Should().Be("Megvettem");
    }

    [Fact]
    public async Task Delete_empty_category_soft_deletes()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-del", "D");
        await ClearCategories(client);
        var created = await (await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("X", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();

        var resp = await client.DeleteAsync($"/api/categories/{created!.Id}");
        resp.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        items.Should().BeEmpty();
    }

    [Fact]
    public async Task Delete_category_with_subcategories_without_force_returns_409()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-df", "F");
        await ClearCategories(client);
        var parent = await (await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("P", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();
        await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("C", "cookie", parent!.Id, null));

        var resp = await client.DeleteAsync($"/api/categories/{parent.Id}");
        resp.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_category_with_force_cascades_subcategories()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-dc", "C");
        await ClearCategories(client);
        var parent = await (await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("P", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();
        await client.PostAsJsonAsync("/api/categories",
            new CreateCategoryRequest("Sub", "cookie", parent!.Id, null));

        var resp = await client.DeleteAsync($"/api/categories/{parent.Id}?force=true");
        resp.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        items.Should().BeEmpty();
    }

    [Fact]
    public async Task New_household_has_4_default_top_level_categories()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|seed-a", "Seed");

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        items!.Select(c => c.Name).Should().BeEquivalentTo(
            new[] { "Bevásárlás", "Hűtő", "Fagyasztó", "Nyaralás" });
        items!.First(c => c.Name == "Bevásárlás").Subcategories.Should().NotBeEmpty();
        items!.First(c => c.Name == "Bevásárlás").CompletedLabel.Should().Be("Megvettem");
        items!.First(c => c.Name == "Hűtő").CompletedLabel.Should().Be("Elfogyott");
    }
}
