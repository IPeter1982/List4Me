using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class DeleteList
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var list = await db.Lists.FirstOrDefaultAsync(l =>
            l.Id == id && l.HouseholdId == hc.Member.HouseholdId && l.DeletedAt == null);
        if (list is null) return Results.NotFound();

        list.DeletedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
