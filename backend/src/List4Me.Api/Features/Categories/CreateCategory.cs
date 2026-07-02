using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public class CreateCategoryValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.IconKey).NotEmpty()
            .Must(k => IconKeys.Allowed.Contains(k))
            .WithMessage("Ismeretlen ikon");
        RuleFor(x => x.CompletedLabel!).MaximumLength(40)
            .When(x => !string.IsNullOrEmpty(x.CompletedLabel));
    }
}

public static class CreateCategory
{
    public static async Task<IResult> Handle(CreateCategoryRequest req, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        if (req.ParentCategoryId is Guid parentId)
        {
            var parent = await db.Categories.FirstOrDefaultAsync(
                c => c.Id == parentId && c.HouseholdId == householdId && c.DeletedAt == null);
            if (parent is null)
                return Results.ValidationProblem(new Dictionary<string, string[]>
                { ["parentCategoryId"] = ["Nincs ilyen kategória"] });
            if (parent.ParentCategoryId is not null)
                return Results.ValidationProblem(new Dictionary<string, string[]>
                { ["parentCategoryId"] = ["Alkategória alá nem hozható létre alkategória (max 1 szint)"] });
        }

        var now = DateTimeOffset.UtcNow;
        var maxSort = await db.Categories
            .Where(c => c.HouseholdId == householdId && c.ParentCategoryId == req.ParentCategoryId)
            .Select(c => (int?)c.SortOrder).MaxAsync() ?? -1;

        var cat = new Category
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Name = req.Name,
            IconKey = req.IconKey,
            ParentCategoryId = req.ParentCategoryId,
            CompletedLabel = string.IsNullOrWhiteSpace(req.CompletedLabel) ? "Kész" : req.CompletedLabel,
            SortOrder = maxSort + 1,
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        var dto = new CategoryDto(cat.Id, cat.Name, cat.IconKey, cat.ParentCategoryId,
            cat.CompletedLabel, cat.SortOrder, Array.Empty<CategoryDto>());
        return Results.Created($"/api/categories/{cat.Id}", dto);
    }
}
