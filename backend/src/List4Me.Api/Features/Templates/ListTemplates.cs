using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Templates;

public static class ListTemplates
{
    public static async Task<IResult> Handle(
        AppDbContext db, HouseholdContext hc, Guid? categoryId = null)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var q = db.ListTemplates.Where(t => t.HouseholdId == householdId);
        if (categoryId is Guid cid) q = q.Where(t => t.CategoryId == cid);

        var items = await q
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TemplateSummaryDto(
                t.Id, t.CategoryId, t.Name, t.CreatedByMemberId, t.Items.Count, t.CreatedAt))
            .ToListAsync();
        return Results.Ok(items);
    }
}
