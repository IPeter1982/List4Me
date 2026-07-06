using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Templates;

public static class GetTemplate
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var exists = await db.ListTemplates.AnyAsync(t =>
            t.Id == id && t.HouseholdId == hc.Member.HouseholdId);
        if (!exists) return Results.NotFound();
        return Results.Ok(await CreateTemplate.LoadDetail(db, id, hc.Member.HouseholdId));
    }
}
