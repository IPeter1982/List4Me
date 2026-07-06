using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class UpdateListItem
{
    public static async Task<IResult> Handle(
        Guid listId, Guid itemId,
        UpdateListItemRequest req,
        AppDbContext db,
        HouseholdContext hc,
        IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var item = await db.ListItems
            .Include(i => i.List)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ListId == listId
                && i.List.HouseholdId == householdId && i.List.DeletedAt == null);
        if (item is null) return Results.NotFound();

        if (req.Quantity.HasValue) item.Quantity = req.Quantity;
        if (req.Unit is not null) item.Unit = string.IsNullOrWhiteSpace(req.Unit) ? null : req.Unit.Trim();
        if (req.ExpiresOn.HasValue) item.ExpiresOn = req.ExpiresOn;
        if (req.Note is not null) item.Note = string.IsNullOrWhiteSpace(req.Note) ? null : req.Note.Trim();

        item.UpdatedAt = DateTimeOffset.UtcNow;
        item.List.UpdatedAt = item.UpdatedAt;
        await db.SaveChangesAsync();

        var dto = new ListItemDto(
            item.Id, item.ProductId, item.Product.Name, item.Product.CategoryId,
            item.Quantity, item.Unit, item.ExpiresOn, item.Note,
            item.IsCompleted, item.CompletedAt, item.CompletedByMemberId, item.SortOrder);
        await notifier.ListItemUpdated(householdId, listId, dto);
        return Results.Ok(dto);
    }
}
