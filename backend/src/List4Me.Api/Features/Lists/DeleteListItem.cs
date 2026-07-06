using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class DeleteListItem
{
    public static async Task<IResult> Handle(Guid listId, Guid itemId,
        AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;
        var item = await db.ListItems
            .Include(i => i.List)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ListId == listId
                && i.List.HouseholdId == householdId && i.List.DeletedAt == null);
        if (item is null) return Results.NotFound();

        db.ListItems.Remove(item);
        item.List.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        await notifier.ListItemDeleted(householdId, listId, itemId);
        return Results.NoContent();
    }
}
