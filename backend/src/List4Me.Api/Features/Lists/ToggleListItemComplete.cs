using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class ToggleListItemComplete
{
    public static async Task<IResult> Complete(Guid listId, Guid itemId,
        AppDbContext db, HouseholdContext hc)
        => await Toggle(listId, itemId, db, hc, complete: true);

    public static async Task<IResult> Uncomplete(Guid listId, Guid itemId,
        AppDbContext db, HouseholdContext hc)
        => await Toggle(listId, itemId, db, hc, complete: false);

    private static async Task<IResult> Toggle(
        Guid listId, Guid itemId, AppDbContext db, HouseholdContext hc, bool complete)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var item = await db.ListItems
            .Include(i => i.List)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ListId == listId
                && i.List.HouseholdId == householdId && i.List.DeletedAt == null);
        if (item is null) return Results.NotFound();

        var now = DateTimeOffset.UtcNow;
        if (complete)
        {
            item.IsCompleted = true;
            item.CompletedAt = now;
            item.CompletedByMemberId = hc.Member.Id;
        }
        else
        {
            item.IsCompleted = false;
            item.CompletedAt = null;
            item.CompletedByMemberId = null;
        }
        item.UpdatedAt = now;
        item.List.UpdatedAt = now;
        await db.SaveChangesAsync();

        return Results.Ok(new ListItemDto(
            item.Id, item.ProductId, item.Product.Name, item.Product.CategoryId,
            item.Quantity, item.Unit, item.ExpiresOn, item.Note,
            item.IsCompleted, item.CompletedAt, item.CompletedByMemberId, item.SortOrder));
    }
}
