using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class GetList
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var exists = await db.Lists.AnyAsync(l =>
            l.Id == id && l.HouseholdId == householdId && l.DeletedAt == null);
        if (!exists) return Results.NotFound();

        return Results.Ok(await CreateList.LoadDetail(db, id, householdId));
    }
}
