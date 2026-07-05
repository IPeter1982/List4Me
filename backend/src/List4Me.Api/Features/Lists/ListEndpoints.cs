using List4Me.Api.Common;

namespace List4Me.Api.Features.Lists;

public static class ListEndpoints
{
    public static IEndpointRouteBuilder MapLists(this IEndpointRouteBuilder app)
    {
        var lists = app.MapGroup("/api/lists").RequireAuthorization();
        lists.MapGet("/", ListLists.Handle);
        // Remaining handlers wired progressively in tasks C3 - C6.

        var items = app.MapGroup("/api/lists/{listId:guid}/items").RequireAuthorization();
        // Handlers wired in Phase D.
        return app;
    }
}
