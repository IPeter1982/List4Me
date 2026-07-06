using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public static class DeleteCategory
{
    public static async Task<IResult> Handle(Guid id, bool? force, AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;
        var cat = await db.Categories
            .Include(c => c.Subcategories.Where(s => s.DeletedAt == null))
            .Include(c => c.Products.Where(p => p.DeletedAt == null))
            .FirstOrDefaultAsync(c => c.Id == id && c.HouseholdId == householdId && c.DeletedAt == null);
        if (cat is null) return Results.NotFound();

        var hasChildren = cat.Subcategories.Count > 0 || cat.Products.Count > 0;
        if (hasChildren && force != true)
        {
            return Results.Conflict(new
            {
                message = "Kategória nem üres",
                subcategories = cat.Subcategories.Count,
                products = cat.Products.Count
            });
        }

        var now = DateTimeOffset.UtcNow;
        cat.DeletedAt = now;
        foreach (var s in cat.Subcategories) s.DeletedAt = now;
        foreach (var p in cat.Products) p.DeletedAt = now;
        await db.SaveChangesAsync();
        await notifier.CategoryDeleted(householdId, id);
        return Results.NoContent();
    }
}
