using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class DeleteListItem
{
    public static async Task<IResult> Handle(Guid listId, Guid itemId,
        AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var item = await db.ListItems
            .Include(i => i.List)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ListId == listId
                && i.List.HouseholdId == hc.Member.HouseholdId && i.List.DeletedAt == null);
        if (item is null) return Results.NotFound();

        db.ListItems.Remove(item);
        item.List.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
