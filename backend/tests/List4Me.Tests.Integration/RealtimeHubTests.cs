using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Api.Features.Lists;
using List4Me.Api.Realtime;
using List4Me.Tests.Integration.Fixtures;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR.Client;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class RealtimeHubTests(PostgresFixture pg)
{
    private static readonly TimeSpan ReceiveTimeout = TimeSpan.FromSeconds(5);

    [Fact]
    public async Task ListCreated_broadcasts_to_other_household_member()
    {
        await using var factory = new ApiFactory(pg);
        var alice = factory.CreateClientAs("auth0|rt-a", name: "Alice");
        var bob = factory.CreateClientAs("auth0|rt-b", name: "Bob");

        (await alice.PostAsJsonAsync("/api/households",
            new CreateHouseholdRequest("Shared"))).EnsureSuccessStatusCode();
        var inviteResp = await alice.PostAsJsonAsync("/api/households/me/invites",
            new CreateInviteRequest(null));
        inviteResp.EnsureSuccessStatusCode();
        var invite = await inviteResp.Content.ReadFromJsonAsync<InviteDto>();
        (await bob.PostAsJsonAsync($"/api/invites/{invite!.Token}/accept",
            new { })).EnsureSuccessStatusCode();

        await using var hubB = HubClientFactory.Build(factory, "auth0|rt-b");
        var received = new TaskCompletionSource<ListDetailDto>(
            TaskCreationOptions.RunContinuationsAsynchronously);
        hubB.On<ListDetailDto>(RealtimeEvents.ListCreated,
            list => received.TrySetResult(list));
        await hubB.StartAsync();

        var cats = await alice.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        var catId = cats![0].Id;
        var createResp = await alice.PostAsJsonAsync("/api/lists",
            new CreateListRequest("Shopping", catId, null));
        createResp.EnsureSuccessStatusCode();

        var winner = await Task.WhenAny(received.Task, Task.Delay(ReceiveTimeout));
        winner.Should().Be(received.Task,
            "Bob's hub client should have received the ListCreated broadcast within the timeout");
        (await received.Task).Name.Should().Be("Shopping");
    }

    [Fact]
    public async Task ListCreated_does_not_broadcast_across_households()
    {
        await using var factory = new ApiFactory(pg);
        var a = factory.CreateClientAs("auth0|iso-rt-a", name: "A");
        var b = factory.CreateClientAs("auth0|iso-rt-b", name: "B");

        (await a.PostAsJsonAsync("/api/households",
            new CreateHouseholdRequest("A-Home"))).EnsureSuccessStatusCode();
        (await b.PostAsJsonAsync("/api/households",
            new CreateHouseholdRequest("B-Home"))).EnsureSuccessStatusCode();

        await using var hubB = HubClientFactory.Build(factory, "auth0|iso-rt-b");
        var received = new TaskCompletionSource<bool>(
            TaskCreationOptions.RunContinuationsAsynchronously);
        hubB.On<ListDetailDto>(RealtimeEvents.ListCreated, _ => received.TrySetResult(true));
        await hubB.StartAsync();

        var aCats = await a.GetFromJsonAsync<CategoryDto[]>("/api/categories");
        (await a.PostAsJsonAsync("/api/lists",
            new CreateListRequest("A-list", aCats![0].Id, null))).EnsureSuccessStatusCode();

        var winner = await Task.WhenAny(received.Task, Task.Delay(TimeSpan.FromSeconds(2)));
        winner.Should().NotBe(received.Task,
            "B is in a different household and must not receive A's broadcast");
    }

    [Fact]
    public async Task Unauthenticated_hub_connection_is_rejected()
    {
        await using var factory = new ApiFactory(pg);
        await using var conn = new HubConnectionBuilder()
            .WithUrl($"{factory.Server.BaseAddress}hubs/household", opts =>
            {
                opts.HttpMessageHandlerFactory = _ => factory.Server.CreateHandler();
                opts.Transports = HttpTransportType.LongPolling;
                opts.SkipNegotiation = false;
            })
            .Build();

        Func<Task> start = () => conn.StartAsync();
        await start.Should().ThrowAsync<Exception>();
    }
}
