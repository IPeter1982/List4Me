namespace List4Me.Api.Domain;

public class ListItem
{
    public Guid Id { get; set; }
    public Guid ListId { get; set; }
    public ListEntity List { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public DateOnly? ExpiresOn { get; set; }
    public string? Note { get; set; }
    public bool IsCompleted { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public Guid? CompletedByMemberId { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
