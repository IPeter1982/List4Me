namespace List4Me.Api.Domain;

public class FavoriteProduct
{
    public Guid HouseholdMemberId { get; set; }
    public HouseholdMember HouseholdMember { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}
