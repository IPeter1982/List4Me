using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Api.Features.Lists;
using List4Me.Api.Features.Products;
using List4Me.Api.Features.Templates;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class TemplateEndpointTests(PostgresFixture pg)
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
    public async Task List_templates_returns_empty_when_none_exist()
    {
        await using var factory = new ApiFactory(pg);
        var (client, _) = await Setup(factory, "auth0|tpl-a", "A");
        var items = await client.GetFromJsonAsync<TemplateSummaryDto[]>("/api/templates");
        items.Should().BeEmpty();
    }

    [Fact]
    public async Task Create_empty_template_returns_201_and_appears_in_list()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|tpl-b", "B");

        var resp = await client.PostAsJsonAsync("/api/templates",
            new CreateTemplateRequest("Alaptemplate", categoryId, null));
        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await resp.Content.ReadFromJsonAsync<TemplateDetailDto>();
        created!.Items.Should().BeEmpty();
        created.Name.Should().Be("Alaptemplate");
    }

    [Fact]
    public async Task Create_template_from_source_list_copies_items()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|tpl-c", "C");
        var products = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products");

        var listResp = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("SrcList", categoryId, null));
        var listId = (await listResp.Content.ReadFromJsonAsync<ListDetailDto>())!.Id;
        foreach (var p in products!.Take(3))
        {
            await client.PostAsJsonAsync($"/api/lists/{listId}/items",
                new CreateListItemRequest(p.Id, 2m, "db", null, "seed"));
        }

        var tplResp = await client.PostAsJsonAsync("/api/templates",
            new CreateTemplateRequest("FromList", categoryId, listId));
        tplResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var tpl = await tplResp.Content.ReadFromJsonAsync<TemplateDetailDto>();
        tpl!.Items.Should().HaveCount(3);
        tpl.Items.Should().OnlyContain(i => i.Quantity == 2m && i.Unit == "db" && i.Note == "seed");
    }

    [Fact]
    public async Task Create_list_from_template_copies_items()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|tpl-d", "D");
        var products = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products");

        var srcListResp = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("Src", categoryId, null));
        var srcId = (await srcListResp.Content.ReadFromJsonAsync<ListDetailDto>())!.Id;
        foreach (var p in products!.Take(2))
            await client.PostAsJsonAsync($"/api/lists/{srcId}/items",
                new CreateListItemRequest(p.Id, 1m, null, null, null));
        var tplResp = await client.PostAsJsonAsync("/api/templates",
            new CreateTemplateRequest("Tpl", categoryId, srcId));
        var templateId = (await tplResp.Content.ReadFromJsonAsync<TemplateDetailDto>())!.Id;

        var newListResp = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("FromTemplate", categoryId, templateId));
        newListResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var newList = await newListResp.Content.ReadFromJsonAsync<ListDetailDto>();
        newList!.Items.Should().HaveCount(2);
        newList.FromTemplateId.Should().Be(templateId);
    }

    [Fact]
    public async Task Get_template_returns_detail_with_items()
    {
        await using var factory = new ApiFactory(pg);
        var (client, categoryId) = await Setup(factory, "auth0|tpl-e", "E");
        var products = await client.GetFromJsonAsync<ProductDto[]>(
            $"/api/categories/{categoryId}/products");

        var srcResp = await client.PostAsJsonAsync("/api/lists",
            new CreateListRequest("Src", categoryId, null));
        var srcId = (await srcResp.Content.ReadFromJsonAsync<ListDetailDto>())!.Id;
        await client.PostAsJsonAsync($"/api/lists/{srcId}/items",
            new CreateListItemRequest(products![0].Id, 1m, "db", null, null));

        var tplResp = await client.PostAsJsonAsync("/api/templates",
            new CreateTemplateRequest("T", categoryId, srcId));
        var tplId = (await tplResp.Content.ReadFromJsonAsync<TemplateDetailDto>())!.Id;

        var detail = await client.GetFromJsonAsync<TemplateDetailDto>($"/api/templates/{tplId}");
        detail!.Items.Should().HaveCount(1);
        detail.Items[0].ProductName.Should().Be(products[0].Name);
    }
}
