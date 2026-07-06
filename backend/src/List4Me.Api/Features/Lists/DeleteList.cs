using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class DeleteList
{
    public static async Task<IResult> Handle(
        Guid id, AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;
        var list = await db.Lists.FirstOrDefaultAsync(l =>
            l.Id == id && l.HouseholdId == householdId && l.DeletedAt == null);
        if (list is null) return Results.NotFound();

        list.DeletedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        await notifier.ListDeleted(householdId, id);
        return Results.NoContent();
    }
}
