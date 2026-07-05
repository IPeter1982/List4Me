namespace List4Me.Api.Domain;

public class ListTemplateItem
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public ListTemplate Template { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public string? Note { get; set; }
    public int SortOrder { get; set; }
}
