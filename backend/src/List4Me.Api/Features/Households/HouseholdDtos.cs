namespace List4Me.Api.Features.Households;

public record CreateHouseholdRequest(string Name);
public record UpdateHouseholdRequest(string Name);
public record CreateInviteRequest(string? Email);

public record HouseholdMemberDto(Guid Id, string DisplayName, string Role, DateTimeOffset JoinedAt);
public record HouseholdDto(Guid Id, string Name, DateTimeOffset CreatedAt, IReadOnlyList<HouseholdMemberDto> Members);
public record InviteDto(Guid Token, string InviteUrl, DateTimeOffset ExpiresAt);
public record InviteInfoDto(Guid Token, string HouseholdName, DateTimeOffset ExpiresAt);
