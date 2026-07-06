using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Products;

public static class CreateProduct
{
    public static async Task<IResult> Handle(
        Guid categoryId,
        CreateProductRequest req,
        AppDbContext db,
        HouseholdContext hc,
        IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var cat = await db.Categories.FirstOrDefaultAsync(c =>
            c.Id == categoryId && c.HouseholdId == householdId && c.DeletedAt == null);
        if (cat is null) return Results.NotFound();

        var now = DateTimeOffset.UtcNow;
        var product = new Product
        {
            Id = Guid.NewGuid(),
            CategoryId = categoryId,
            Name = req.Name.Trim(),
            DefaultQuantity = req.DefaultQuantity,
            DefaultUnit = string.IsNullOrWhiteSpace(req.DefaultUnit) ? null : req.DefaultUnit.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        var dto = new ProductDto(product.Id, product.CategoryId, product.Name,
            product.DefaultQuantity, product.DefaultUnit, IsFavorite: false);
        await notifier.ProductCreated(householdId, dto);
        return Results.Created($"/api/products/{product.Id}", dto);
    }
}
