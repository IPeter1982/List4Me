using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Household> Households => Set<Household>();
    public DbSet<HouseholdMember> HouseholdMembers => Set<HouseholdMember>();
    public DbSet<HouseholdInvite> HouseholdInvites => Set<HouseholdInvite>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<FavoriteProduct> FavoriteProducts => Set<FavoriteProduct>();
    public DbSet<ListEntity> Lists => Set<ListEntity>();
    public DbSet<ListItem> ListItems => Set<ListItem>();
    public DbSet<ListTemplate> ListTemplates => Set<ListTemplate>();
    public DbSet<ListTemplateItem> ListTemplateItems => Set<ListTemplateItem>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Household>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
        });

        mb.Entity<HouseholdMember>(e =>
        {
            e.Property(x => x.Auth0UserId).IsRequired().HasMaxLength(255);
            e.Property(x => x.DisplayName).HasMaxLength(120);
            e.Property(x => x.Role).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => x.Auth0UserId).IsUnique();
            e.HasIndex(x => x.HouseholdId);
            e.HasOne(x => x.Household).WithMany(h => h.Members)
                .HasForeignKey(x => x.HouseholdId).OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<HouseholdInvite>(e =>
        {
            e.Property(x => x.Email).HasMaxLength(255);
            e.HasIndex(x => x.Token).IsUnique();
            e.HasIndex(x => x.HouseholdId);
            e.HasOne(x => x.Household).WithMany()
                .HasForeignKey(x => x.HouseholdId).OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<Category>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(80);
            e.Property(x => x.IconKey).IsRequired().HasMaxLength(64);
            e.Property(x => x.CompletedLabel).IsRequired().HasMaxLength(40);
            e.HasIndex(x => new { x.HouseholdId, x.DeletedAt });
            e.HasIndex(x => x.ParentCategoryId);
            e.HasOne(x => x.ParentCategory).WithMany(c => c.Subcategories)
                .HasForeignKey(x => x.ParentCategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<Product>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
            e.Property(x => x.DefaultQuantity).HasPrecision(12, 3);
            e.Property(x => x.DefaultUnit).HasMaxLength(20);
            e.HasIndex(x => new { x.CategoryId, x.DeletedAt });
            e.HasIndex(x => x.Name);
            e.HasOne(x => x.Category).WithMany(c => c.Products)
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<FavoriteProduct>(e =>
        {
            e.HasKey(x => new { x.HouseholdMemberId, x.ProductId });
            e.HasOne(x => x.HouseholdMember).WithMany()
                .HasForeignKey(x => x.HouseholdMemberId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<ListEntity>(e =>
        {
            e.ToTable("Lists");
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
            e.HasIndex(x => new { x.HouseholdId, x.ArchivedAt, x.DeletedAt });
            e.HasOne(x => x.Category).WithMany()
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<ListItem>(e =>
        {
            e.Property(x => x.Quantity).HasPrecision(12, 3);
            e.Property(x => x.Unit).HasMaxLength(20);
            e.Property(x => x.Note).HasMaxLength(500);
            e.HasIndex(x => new { x.ListId, x.IsCompleted });
            e.HasOne(x => x.List).WithMany(l => l.Items)
                .HasForeignKey(x => x.ListId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<ListTemplate>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
            e.HasIndex(x => new { x.HouseholdId, x.CategoryId });
            e.HasOne(x => x.Category).WithMany()
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<ListTemplateItem>(e =>
        {
            e.Property(x => x.Quantity).HasPrecision(12, 3);
            e.Property(x => x.Unit).HasMaxLength(20);
            e.Property(x => x.Note).HasMaxLength(500);
            e.HasOne(x => x.Template).WithMany(t => t.Items)
                .HasForeignKey(x => x.TemplateId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
