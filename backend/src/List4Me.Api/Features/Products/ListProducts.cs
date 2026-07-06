using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Products;

public static class ListProducts
{
    public static async Task<IResult> Handle(
        Guid categoryId,
        AppDbContext db,
        HouseholdContext hc,
        string? q = null,
        bool favoritesOnly = false)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var root = await db.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId
                && c.HouseholdId == householdId && c.DeletedAt == null);
        if (root is null) return Results.NotFound();

        var subIds = await db.Categories
            .Where(c => c.HouseholdId == householdId && c.DeletedAt == null
                && (c.Id == categoryId || c.ParentCategoryId == categoryId))
            .Select(c => c.Id).ToListAsync();

        var query = db.Products
            .Where(p => subIds.Contains(p.CategoryId) && p.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var pattern = $"%{q.Trim()}%";
            query = query.Where(p => EF.Functions.ILike(p.Name, pattern));
        }

        var favoriteIds = await db.FavoriteProducts
            .Where(f => f.HouseholdMemberId == hc.Member.Id)
            .Select(f => f.ProductId).ToListAsync();

        if (favoritesOnly)
            query = query.Where(p => favoriteIds.Contains(p.Id));

        var items = await query
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto(
                p.Id,
                p.CategoryId,
                p.Name,
                p.DefaultQuantity,
                p.DefaultUnit,
                favoriteIds.Contains(p.Id)))
            .ToListAsync();

        return Results.Ok(items);
    }
}
