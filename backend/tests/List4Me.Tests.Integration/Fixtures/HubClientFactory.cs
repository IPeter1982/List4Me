using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR.Client;

namespace List4Me.Tests.Integration.Fixtures;

public static class HubClientFactory
{
    public static HubConnection Build(ApiFactory factory, string auth0Sub)
    {
        return new HubConnectionBuilder()
            .WithUrl($"{factory.Server.BaseAddress}hubs/household", opts =>
            {
                opts.HttpMessageHandlerFactory = _ => factory.Server.CreateHandler();
                opts.WebSocketFactory = null;
                opts.AccessTokenProvider = () => Task.FromResult<string?>(auth0Sub);
                opts.Transports = HttpTransportType.LongPolling;
                opts.SkipNegotiation = false;
            })
            .Build();
    }
}
