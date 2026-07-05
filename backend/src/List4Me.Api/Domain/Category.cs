namespace List4Me.Api.Domain;

public class Category
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public string Name { get; set; } = "";
    public string IconKey { get; set; } = "shopping-cart";
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public string CompletedLabel { get; set; } = "Kész";
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    public ICollection<Category> Subcategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
