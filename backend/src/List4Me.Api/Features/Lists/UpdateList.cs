using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class UpdateList
{
    public static async Task<IResult> Handle(
        Guid id,
        UpdateListRequest req,
        AppDbContext db,
        HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var list = await db.Lists.FirstOrDefaultAsync(l =>
            l.Id == id && l.HouseholdId == householdId && l.DeletedAt == null);
        if (list is null) return Results.NotFound();

        if (!string.IsNullOrWhiteSpace(req.Name)) list.Name = req.Name.Trim();
        if (req.Archived is bool a)
            list.ArchivedAt = a ? DateTimeOffset.UtcNow : null;

        list.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        return Results.Ok(await CreateList.LoadDetail(db, id, householdId));
    }
}
