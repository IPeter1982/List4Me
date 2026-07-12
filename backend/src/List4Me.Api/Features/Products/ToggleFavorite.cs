using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Products;

public static class ToggleFavorite
{
    public static async Task<IResult> Add(Guid id, AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var product = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id
                && p.Category.HouseholdId == householdId && p.DeletedAt == null);
        if (product is null) return Results.NotFound();

        var existing = await db.FavoriteProducts.FirstOrDefaultAsync(f =>
            f.HouseholdMemberId == hc.Member.Id && f.ProductId == id);
        if (existing is null)
        {
            db.FavoriteProducts.Add(new FavoriteProduct
            {
                HouseholdMemberId = hc.Member.Id,
                ProductId = id,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
            await notifier.ProductFavoriteChanged(householdId, hc.Member.Id, id, isFavorite: true);
        }
        return Results.NoContent();
    }

    public static async Task<IResult> Remove(Guid id, AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;
        var existing = await db.FavoriteProducts.FirstOrDefaultAsync(f =>
            f.HouseholdMemberId == hc.Member.Id && f.ProductId == id);
        if (existing is not null)
        {
            db.FavoriteProducts.Remove(existing);
            await db.SaveChangesAsync();
            await notifier.ProductFavoriteChanged(householdId, hc.Member.Id, id, isFavorite: false);
        }
        return Results.NoContent();
    }
}
