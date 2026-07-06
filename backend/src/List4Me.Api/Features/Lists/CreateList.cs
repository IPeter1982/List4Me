using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Lists;

public static class CreateList
{
    public static async Task<IResult> Handle(
        CreateListRequest req,
        AppDbContext db,
        HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var cat = await db.Categories.FirstOrDefaultAsync(c =>
            c.Id == req.CategoryId && c.HouseholdId == householdId && c.DeletedAt == null);
        if (cat is null) return Results.NotFound();

        var now = DateTimeOffset.UtcNow;
        var list = new ListEntity
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            CategoryId = req.CategoryId,
            Name = req.Name.Trim(),
            CreatedByMemberId = hc.Member.Id,
            FromTemplateId = req.FromTemplateId,
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Lists.Add(list);

        if (req.FromTemplateId is Guid templateId)
        {
            var template = await db.ListTemplates
                .Include(t => t.Items)
                .FirstOrDefaultAsync(t => t.Id == templateId && t.HouseholdId == householdId);
            if (template is null) return Results.NotFound();

            foreach (var (ti, idx) in template.Items.OrderBy(i => i.SortOrder).Select((i, idx) => (i, idx)))
            {
                db.ListItems.Add(new ListItem
                {
                    Id = Guid.NewGuid(),
                    ListId = list.Id,
                    ProductId = ti.ProductId,
                    Quantity = ti.Quantity,
                    Unit = ti.Unit,
                    Note = ti.Note,
                    IsCompleted = false,
                    SortOrder = idx,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
        }

        await db.SaveChangesAsync();

        return Results.Created($"/api/lists/{list.Id}",
            await LoadDetail(db, list.Id, householdId));
    }

    internal static async Task<ListDetailDto> LoadDetail(AppDbContext db, Guid id, Guid householdId)
    {
        var l = await db.Lists
            .Include(l => l.Items).ThenInclude(i => i.Product)
            .Where(l => l.Id == id && l.HouseholdId == householdId && l.DeletedAt == null)
            .FirstAsync();

        return new ListDetailDto(
            l.Id, l.CategoryId, l.Name, l.CreatedByMemberId, l.FromTemplateId,
            l.CreatedAt, l.ArchivedAt,
            l.Items.OrderBy(i => i.SortOrder).Select(i => new ListItemDto(
                i.Id, i.ProductId, i.Product.Name, i.Product.CategoryId,
                i.Quantity, i.Unit, i.ExpiresOn, i.Note,
                i.IsCompleted, i.CompletedAt, i.CompletedByMemberId, i.SortOrder)).ToList());
    }
}
