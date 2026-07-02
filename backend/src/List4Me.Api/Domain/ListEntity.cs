namespace List4Me.Api.Domain;

public class ListEntity
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = "";
    public Guid CreatedByMemberId { get; set; }
    public Guid? FromTemplateId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    public ICollection<ListItem> Items { get; set; } = new List<ListItem>();
}
