using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public static class GetInvite
{
    public static async Task<IResult> Handle(Guid token, AppDbContext db, HouseholdContext hc)
    {
        if (hc.User is null) return Results.Unauthorized();
        var invite = await db.HouseholdInvites
            .Include(i => i.Household)
            .FirstOrDefaultAsync(i => i.Token == token);
        if (invite is null || invite.UsedAt is not null || invite.ExpiresAt < DateTimeOffset.UtcNow)
            return Results.NotFound();
        return Results.Ok(new InviteInfoDto(invite.Token, invite.Household.Name, invite.ExpiresAt));
    }
}
