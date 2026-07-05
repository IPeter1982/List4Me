using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class CreateListItem
{
    public static async Task<IResult> Handle(
        Guid listId,
        CreateListItemRequest req,
        AppDbContext db,
        HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var list = await db.Lists.FirstOrDefaultAsync(l =>
            l.Id == listId && l.HouseholdId == householdId && l.DeletedAt == null);
        if (list is null) return Results.NotFound();

        var product = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == req.ProductId
                && p.Category.HouseholdId == householdId && p.DeletedAt == null);
        if (product is null) return Results.NotFound();

        var now = DateTimeOffset.UtcNow;
        var nextSort = 1 + (await db.ListItems.Where(i => i.ListId == listId)
            .Select(i => (int?)i.SortOrder).MaxAsync() ?? -1);

        var item = new ListItem
        {
            Id = Guid.NewGuid(),
            ListId = listId,
            ProductId = req.ProductId,
            Quantity = req.Quantity ?? product.DefaultQuantity,
            Unit = string.IsNullOrWhiteSpace(req.Unit) ? product.DefaultUnit : req.Unit.Trim(),
            ExpiresOn = req.ExpiresOn,
            Note = string.IsNullOrWhiteSpace(req.Note) ? null : req.Note.Trim(),
            IsCompleted = false,
            SortOrder = nextSort,
            CreatedAt = now,
            UpdatedAt = now
        };
        db.ListItems.Add(item);
        list.UpdatedAt = now;
        await db.SaveChangesAsync();

        var dto = new ListItemDto(item.Id, item.ProductId, product.Name, product.CategoryId,
            item.Quantity, item.Unit, item.ExpiresOn, item.Note,
            item.IsCompleted, item.CompletedAt, item.CompletedByMemberId, item.SortOrder);
        return Results.Created($"/api/lists/{listId}/items/{item.Id}", dto);
    }
}
