using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.IconKey).Must(k => IconKeys.Allowed.Contains(k)).WithMessage("Ismeretlen ikon");
        RuleFor(x => x.CompletedLabel).NotEmpty().MaximumLength(40);
    }
}

public static class UpdateCategory
{
    public static async Task<IResult> Handle(Guid id, UpdateCategoryRequest req, AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;
        var cat = await db.Categories.FirstOrDefaultAsync(
            c => c.Id == id && c.HouseholdId == householdId && c.DeletedAt == null);
        if (cat is null) return Results.NotFound();

        cat.Name = req.Name;
        cat.IconKey = req.IconKey;
        cat.CompletedLabel = req.CompletedLabel;
        if (req.SortOrder.HasValue) cat.SortOrder = req.SortOrder.Value;
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        await notifier.CategoryUpdated(householdId, new CategoryDto(
            cat.Id, cat.Name, cat.IconKey, cat.ParentCategoryId,
            cat.CompletedLabel, cat.SortOrder, Array.Empty<CategoryDto>()));
        return Results.Ok();
    }
}
