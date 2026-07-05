namespace List4Me.Api.Domain;

public enum HouseholdRole { Owner, Member }

public class HouseholdMember
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Household Household { get; set; } = null!;
    public string Auth0UserId { get; set; } = "";
    public HouseholdRole Role { get; set; }
    public string DisplayName { get; set; } = "";
    public DateTimeOffset JoinedAt { get; set; }
}
