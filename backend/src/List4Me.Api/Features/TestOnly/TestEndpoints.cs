namespace List4Me.Api.Features.TestOnly;

public static class TestEndpoints
{
    public static void MapTestEndpoints(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/test");
        g.MapPost("/reset", TestResetHandler.Handle);
        g.MapPost("/login-as", TestLoginAsHandler.Handle);
    }
}
