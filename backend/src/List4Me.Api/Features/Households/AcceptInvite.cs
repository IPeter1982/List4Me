using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using List4Me.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public static class AcceptInvite
{
    public static async Task<IResult> Handle(Guid token, AppDbContext db, HouseholdContext hc, IRealtimeNotifier notifier)
    {
        if (hc.User is null) return Results.Unauthorized();
        if (hc.Member is not null) return Results.Conflict(new { message = "Already in a household" });

        var invite = await db.HouseholdInvites.FirstOrDefaultAsync(i => i.Token == token);
        if (invite is null || invite.UsedAt is not null || invite.ExpiresAt < DateTimeOffset.UtcNow)
            return Results.NotFound();

        var member = new HouseholdMember
        {
            Id = Guid.NewGuid(),
            HouseholdId = invite.HouseholdId,
            Auth0UserId = hc.User.Auth0UserId,
            Role = HouseholdRole.Member,
            DisplayName = hc.User.DisplayName ?? "User",
            JoinedAt = DateTimeOffset.UtcNow
        };
        invite.UsedAt = DateTimeOffset.UtcNow;
        db.HouseholdMembers.Add(member);
        await db.SaveChangesAsync();

        await notifier.MemberJoined(invite.HouseholdId, new HouseholdMemberDto(
            member.Id, member.DisplayName, member.Role.ToString(), member.JoinedAt));
        return Results.Ok();
    }
}
