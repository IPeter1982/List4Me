using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;

namespace List4Me.Api.Features.Households;

public class CreateInviteValidator : AbstractValidator<CreateInviteRequest>
{
    public CreateInviteValidator()
    {
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
    }
}

public static class CreateInvite
{
    public static async Task<IResult> Handle(
        CreateInviteRequest req, AppDbContext db, HouseholdContext hc, IConfiguration cfg)
    {
        if (hc.Member is null) return Results.NotFound();
        if (hc.Member.Role != HouseholdRole.Owner) return Results.Forbid();

        var invite = new HouseholdInvite
        {
            Id = Guid.NewGuid(),
            HouseholdId = hc.Member.HouseholdId,
            Email = req.Email,
            Token = Guid.NewGuid(),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            CreatedByMemberId = hc.Member.Id,
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.HouseholdInvites.Add(invite);
        await db.SaveChangesAsync();

        var baseUrl = cfg["FrontendUrl"] ?? "http://localhost:5173";
        var url = $"{baseUrl}/invite/{invite.Token}";
        return Results.Created(url, new InviteDto(invite.Token, url, invite.ExpiresAt));
    }
}
