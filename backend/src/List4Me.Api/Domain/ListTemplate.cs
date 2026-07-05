namespace List4Me.Api.Domain;

public class ListTemplate
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = "";
    public Guid CreatedByMemberId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<ListTemplateItem> Items { get; set; } = new List<ListTemplateItem>();
}
