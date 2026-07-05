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
}
