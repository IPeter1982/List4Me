using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Templates;

public static class CreateTemplate
{
    public static async Task<IResult> Handle(
        CreateTemplateRequest req,
        AppDbContext db,
        HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        var cat = await db.Categories.FirstOrDefaultAsync(c =>
            c.Id == req.CategoryId && c.HouseholdId == householdId && c.DeletedAt == null);
        if (cat is null) return Results.NotFound();

        var now = DateTimeOffset.UtcNow;
        var template = new ListTemplate
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            CategoryId = req.CategoryId,
            Name = req.Name.Trim(),
            CreatedByMemberId = hc.Member.Id,
            CreatedAt = now
        };
        db.ListTemplates.Add(template);

        if (req.SourceListId is Guid srcId)
        {
            var src = await db.Lists
                .Include(l => l.Items)
                .FirstOrDefaultAsync(l => l.Id == srcId
                    && l.HouseholdId == householdId && l.DeletedAt == null);
            if (src is null) return Results.NotFound();

            foreach (var (item, idx) in src.Items.OrderBy(i => i.SortOrder).Select((i, idx) => (i, idx)))
            {
                db.ListTemplateItems.Add(new ListTemplateItem
                {
                    Id = Guid.NewGuid(),
                    TemplateId = template.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    Note = item.Note,
                    SortOrder = idx
                });
            }
        }

        await db.SaveChangesAsync();

        return Results.Created($"/api/templates/{template.Id}",
            await LoadDetail(db, template.Id, householdId));
    }

    internal static async Task<TemplateDetailDto> LoadDetail(
        AppDbContext db, Guid id, Guid householdId)
    {
        var t = await db.ListTemplates
            .Include(t => t.Items).ThenInclude(i => i.Product)
            .Where(t => t.Id == id && t.HouseholdId == householdId)
            .FirstAsync();

        return new TemplateDetailDto(
            t.Id, t.CategoryId, t.Name, t.CreatedByMemberId, t.CreatedAt,
            t.Items.OrderBy(i => i.SortOrder).Select(i => new TemplateItemDto(
                i.Id, i.ProductId, i.Product.Name,
                i.Quantity, i.Unit, i.Note, i.SortOrder)).ToList());
    }
}
