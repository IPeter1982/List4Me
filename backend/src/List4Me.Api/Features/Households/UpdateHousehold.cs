using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public class UpdateHouseholdValidator : AbstractValidator<UpdateHouseholdRequest>
{
    public UpdateHouseholdValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
    }
}

public static class UpdateHousehold
{
    public static async Task<IResult> Handle(UpdateHouseholdRequest req, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        if (hc.Member.Role != HouseholdRole.Owner) return Results.Forbid();

        var household = await db.Households.FirstAsync(h => h.Id == hc.Member.HouseholdId);
        household.Name = req.Name;
        await db.SaveChangesAsync();
        return Results.Ok();
    }
}
