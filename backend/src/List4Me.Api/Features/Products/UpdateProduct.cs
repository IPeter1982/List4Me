using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Products;

public static class UpdateProduct
{
    public static async Task<IResult> Handle(
        Guid id,
        UpdateProductRequest req,
        AppDbContext db,
        HouseholdContext hc,
        IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var product = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id
                && p.Category.HouseholdId == householdId && p.DeletedAt == null);
        if (product is null) return Results.NotFound();

        product.Name = req.Name.Trim();
        product.DefaultQuantity = req.DefaultQuantity;
        product.DefaultUnit = string.IsNullOrWhiteSpace(req.DefaultUnit) ? null : req.DefaultUnit.Trim();
        product.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        var isFav = await db.FavoriteProducts.AnyAsync(f =>
            f.HouseholdMemberId == hc.Member.Id && f.ProductId == id);

        var dto = new ProductDto(product.Id, product.CategoryId, product.Name,
            product.DefaultQuantity, product.DefaultUnit, isFav);
        await notifier.ProductUpdated(householdId, dto);
        return Results.Ok(dto);
    }
}
