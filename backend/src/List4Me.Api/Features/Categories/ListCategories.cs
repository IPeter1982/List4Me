using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public static class ListCategories
{
    public static async Task<IResult> Handle(AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();

        var householdId = hc.Member.HouseholdId;
        var rows = await db.Categories
            .Where(c => c.HouseholdId == householdId && c.DeletedAt == null)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync();

        var byParent = rows.ToLookup(c => c.ParentCategoryId);

        List<CategoryDto> Build(Guid? parent) =>
            byParent[parent].Select(c => new CategoryDto(
                c.Id, c.Name, c.IconKey, c.ParentCategoryId, c.CompletedLabel, c.SortOrder,
                Build(c.Id))).ToList();

        return Results.Ok(Build(null));
    }
}
