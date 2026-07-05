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
public class ListEndpointTests(PostgresFixture pg)
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
    public async Task List_lists_returns_empty_when_none_created()
    {
        await using var factory = new ApiFactory(pg);
        var (client, _) = await Setup(factory, "auth0|lst-a", "A");

        var items = await client.GetFromJsonAsync<ListSummaryDto[]>("/api/lists");
        items.Should().BeEmpty();
    }

    [Fact]
    public async Task Create_empty_list_returns_201_and_appears_in_list()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|lst-b", "B");

        var resp = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("Hétfő", categoryId, null));
        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await resp.Content.ReadFromJsonAsync<ListDetailDto>();
        created!.Items.Should().BeEmpty();

        var all = await client.GetFromJsonAsync<ListSummaryDto[]>("/api/lists");
        all.Should().ContainSingle(l => l.Id == created.Id);
    }

    [Fact]
    public async Task Create_list_rejects_unknown_category()
    {
        await using var factory = new ApiFactory(pg);
        var (client, _) = await Setup(factory, "auth0|lst-c", "C");

        var resp = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("X", Guid.NewGuid(), null));
        resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Get_list_returns_detail_with_empty_items_for_new_empty_list()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|lst-d", "D");

        var create = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("X", categoryId, null));
        var listId = (await create.Content.ReadFromJsonAsync<ListDetailDto>())!.Id;

        var detail = await client.GetFromJsonAsync<ListDetailDto>($"/api/lists/{listId}");
        detail!.Id.Should().Be(listId);
        detail.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task Update_list_renames_it()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|lst-e", "E");
        var create = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("Old", categoryId, null));
        var id = (await create.Content.ReadFromJsonAsync<ListDetailDto>())!.Id;

        var patch = await client.PatchAsJsonAsync($"/api/lists/{id}",
            new UpdateListRequest("New", null));
        patch.StatusCode.Should().Be(HttpStatusCode.OK);

        var detail = await client.GetFromJsonAsync<ListDetailDto>($"/api/lists/{id}");
        detail!.Name.Should().Be("New");
    }

    [Fact]
    public async Task Archive_list_hides_from_default_query_but_appears_when_archived_true()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|lst-f", "F");
        var create = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("ToArchive", categoryId, null));
        var id = (await create.Content.ReadFromJsonAsync<ListDetailDto>())!.Id;

        await client.PatchAsJsonAsync($"/api/lists/{id}", new UpdateListRequest(null, true));

        var active = await client.GetFromJsonAsync<ListSummaryDto[]>("/api/lists");
        active.Should().NotContain(l => l.Id == id);

        var archived = await client.GetFromJsonAsync<ListSummaryDto[]>("/api/lists?archived=true");
        archived.Should().ContainSingle(l => l.Id == id && l.ArchivedAt != null);
    }
}
