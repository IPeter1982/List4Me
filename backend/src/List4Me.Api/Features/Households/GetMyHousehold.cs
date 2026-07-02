using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public static class GetMyHousehold
{
    public static async Task<IResult> Handle(AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();

        var household = await db.Households
            .Include(h => h.Members)
            .FirstAsync(h => h.Id == hc.Member.HouseholdId);

        var dto = new HouseholdDto(
            household.Id, household.Name, household.CreatedAt,
            household.Members
                .OrderBy(m => m.JoinedAt)
                .Select(m => new HouseholdMemberDto(m.Id, m.DisplayName, m.Role.ToString(), m.JoinedAt))
                .ToList());
        return Results.Ok(dto);
    }
}
