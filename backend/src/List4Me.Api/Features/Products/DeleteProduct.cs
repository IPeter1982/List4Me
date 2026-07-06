using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Products;

public static class DeleteProduct
{
    public static async Task<IResult> Handle(Guid id, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var product = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id
                && p.Category.HouseholdId == householdId && p.DeletedAt == null);
        if (product is null) return Results.NotFound();

        product.DeletedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
