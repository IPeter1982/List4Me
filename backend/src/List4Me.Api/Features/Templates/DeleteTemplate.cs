using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Templates;

public static class DeleteTemplate
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;
        var template = await db.ListTemplates
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id && t.HouseholdId == householdId);
        if (template is null) return Results.NotFound();

        db.ListTemplateItems.RemoveRange(template.Items);
        db.ListTemplates.Remove(template);
        await db.SaveChangesAsync();
        await notifier.TemplateDeleted(householdId, id);
        return Results.NoContent();
    }
}
