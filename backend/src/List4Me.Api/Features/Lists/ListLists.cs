using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class ListLists
{
    public static async Task<IResult> Handle(
        AppDbContext db,
        HouseholdContext hc,
        Guid? categoryId = null,
        bool archived = false)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var query = db.Lists
            .Where(l => l.HouseholdId == householdId && l.DeletedAt == null);

        query = archived
            ? query.Where(l => l.ArchivedAt != null)
            : query.Where(l => l.ArchivedAt == null);

        if (categoryId is Guid cid)
            query = query.Where(l => l.CategoryId == cid);

        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new ListSummaryDto(
                l.Id,
                l.CategoryId,
                l.Name,
                l.CreatedByMemberId,
                l.FromTemplateId,
                l.Items.Count,
                l.Items.Count(i => i.IsCompleted),
                l.CreatedAt,
                l.ArchivedAt))
            .ToListAsync();

        return Results.Ok(items);
    }
}
