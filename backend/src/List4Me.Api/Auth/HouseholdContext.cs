using List4Me.Api.Domain;

namespace List4Me.Api.Auth;

/// <summary>
/// Resolved per-request: identifies the current user and, if they belong to a household,
/// exposes the HouseholdMember row so endpoints can scope queries.
/// </summary>
public class HouseholdContext
{
    public CurrentUser? User { get; set; }
    public HouseholdMember? Member { get; set; }

    public Guid RequireHouseholdId() =>
        Member?.HouseholdId ?? throw new InvalidOperationException("No household context");

    public Guid RequireMemberId() =>
        Member?.Id ?? throw new InvalidOperationException("No household context");
}
