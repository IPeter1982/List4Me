using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public class CreateHouseholdValidator : AbstractValidator<CreateHouseholdRequest>
{
    public CreateHouseholdValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
    }
}

public static class CreateHousehold
{
    public static async Task<IResult> Handle(
        CreateHouseholdRequest req,
        AppDbContext db,
        HouseholdContext hc)
    {
        if (hc.User is null) return Results.Unauthorized();
        if (hc.Member is not null) return Results.Conflict(new { message = "User already in a household" });

        var now = DateTimeOffset.UtcNow;
        var household = new Household { Id = Guid.NewGuid(), Name = req.Name, CreatedAt = now };
        var member = new HouseholdMember
        {
            Id = Guid.NewGuid(),
            Household = household,
            HouseholdId = household.Id,
            Auth0UserId = hc.User.Auth0UserId,
            Role = HouseholdRole.Owner,
            DisplayName = hc.User.DisplayName ?? "User",
            JoinedAt = now
        };

        db.Households.Add(household);
        db.HouseholdMembers.Add(member);
        await db.SaveChangesAsync();

        var dto = new HouseholdDto(household.Id, household.Name, household.CreatedAt,
            new[] { new HouseholdMemberDto(member.Id, member.DisplayName, member.Role.ToString(), member.JoinedAt) });
        return Results.Created($"/api/households/{household.Id}", dto);
    }
}
