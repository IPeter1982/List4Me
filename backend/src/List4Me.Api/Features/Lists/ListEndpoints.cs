using List4Me.Api.Common;

namespace List4Me.Api.Features.Lists;

public static class ListEndpoints
{
    public static IEndpointRouteBuilder MapLists(this IEndpointRouteBuilder app)
    {
        var lists = app.MapGroup("/api/lists").RequireAuthorization();
        lists.MapGet("/", ListLists.Handle);
        lists.MapPost("/", CreateList.Handle)
            .AddEndpointFilter<ValidationFilter<CreateListRequest>>();
        lists.MapGet("/{id:guid}", GetList.Handle);
        lists.MapPatch("/{id:guid}", UpdateList.Handle)
            .AddEndpointFilter<ValidationFilter<UpdateListRequest>>();
        lists.MapDelete("/{id:guid}", DeleteList.Handle);

        var items = app.MapGroup("/api/lists/{listId:guid}/items").RequireAuthorization();
        items.MapPost("/", CreateListItem.Handle)
            .AddEndpointFilter<ValidationFilter<CreateListItemRequest>>();
        items.MapPatch("/{itemId:guid}", UpdateListItem.Handle)
            .AddEndpointFilter<ValidationFilter<UpdateListItemRequest>>();
        items.MapPost("/{itemId:guid}/complete", ToggleListItemComplete.Complete);
        items.MapPost("/{itemId:guid}/uncomplete", ToggleListItemComplete.Uncomplete);
        items.MapDelete("/{itemId:guid}", DeleteListItem.Handle);
        return app;
    }
}
