using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Api.Features.Lists;
using List4Me.Api.Features.Products;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class ListItemEndpointTests(PostgresFixture pg)
{
    private static async Task<(HttpClient client, Guid categoryId, Guid listId, Guid productId)>
        Setup(ApiFactory factory, string userId, string name)
    {
        var client = factory.CreateClientAs(userId, name: name);
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest($"{name}-House"));
        var cats = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        var categoryId = cats![0].Id;
        var products = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products");
        var productId = products![0].Id;
        var listResp = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("Test", categoryId, null));
        var listId = (await listResp.Content.ReadFromJsonAsync<ListDetailDto>())!.Id;
        return (client, categoryId, listId, productId);
    }

    [Fact]
    public async Task Add_item_to_list_returns_201_and_appears_in_detail()
    {
        await using var factory = new ApiFactory(pg);
        var (client, _, listId, productId) = await Setup(factory, "auth0|itm-a", "A");

        var resp = await client.PostAsJsonAsync($"/api/lists/{listId}/items",
            new CreateListItemRequest(productId, 2m, "db", null, "kis csomag"));
        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var item = await resp.Content.ReadFromJsonAsync<ListItemDto>();
        item!.ProductId.Should().Be(productId);
        item.Quantity.Should().Be(2m);
        item.Unit.Should().Be("db");

        var detail = await client.GetFromJsonAsync<ListDetailDto>($"/api/lists/{listId}");
        detail!.Items.Should().ContainSingle(i => i.Id == item.Id);
    }

    [Fact]
    public async Task Add_item_rejects_product_from_another_household()
    {
        await using var factory = new ApiFactory(pg);
        var (aliceClient, _, aliceList, _) = await Setup(factory, "auth0|itm-iso-a", "Alice");
        var (_, bobCat, _, _) = await Setup(factory, "auth0|itm-iso-b", "Bob");
        var bobProducts = await aliceClient.GetAsync($"/api/categories/{bobCat}/products");
        bobProducts.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var resp = await aliceClient.PostAsJsonAsync($"/api/lists/{aliceList}/items",
            new CreateListItemRequest(Guid.NewGuid(), null, null, null, null));
        resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Patch_item_updates_quantity_note_expiry()
    {
        await using var factory = new ApiFactory(pg);
        var (client, _, listId, productId) = await Setup(factory, "auth0|itm-b", "B");
        var addResp = await client.PostAsJsonAsync($"/api/lists/{listId}/items",
            new CreateListItemRequest(productId, 1m, "db", null, null));
        var added = await addResp.Content.ReadFromJsonAsync<ListItemDto>();

        var patch = await client.PatchAsJsonAsync($"/api/lists/{listId}/items/{added!.Id}",
            new UpdateListItemRequest(3m, "kg", new DateOnly(2027, 1, 1), "más"));
        patch.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await patch.Content.ReadFromJsonAsync<ListItemDto>();
        updated!.Quantity.Should().Be(3m);
        updated.Unit.Should().Be("kg");
        updated.ExpiresOn.Should().Be(new DateOnly(2027, 1, 1));
        updated.Note.Should().Be("más");
    }

    [Fact]
    public async Task Complete_item_sets_flag_completed_by_and_uncomplete_reverses()
    {
        await using var factory = new ApiFactory(pg);
        var (client, _, listId, productId) = await Setup(factory, "auth0|itm-c", "C");
        var addResp = await client.PostAsJsonAsync($"/api/lists/{listId}/items",
            new CreateListItemRequest(productId, null, null, null, null));
        var added = await addResp.Content.ReadFromJsonAsync<ListItemDto>();

        var comp = await client.PostAsync(
            $"/api/lists/{listId}/items/{added!.Id}/complete", content: null);
        comp.StatusCode.Should().Be(HttpStatusCode.OK);
        var completed = await comp.Content.ReadFromJsonAsync<ListItemDto>();
        completed!.IsCompleted.Should().BeTrue();
        completed.CompletedAt.Should().NotBeNull();
        completed.CompletedByMemberId.Should().NotBeNull();

        var uncomp = await client.PostAsync(
            $"/api/lists/{listId}/items/{added.Id}/uncomplete", content: null);
        uncomp.StatusCode.Should().Be(HttpStatusCode.OK);
        var reverted = await uncomp.Content.ReadFromJsonAsync<ListItemDto>();
        reverted!.IsCompleted.Should().BeFalse();
        reverted.CompletedAt.Should().BeNull();
        reverted.CompletedByMemberId.Should().BeNull();
    }
}
