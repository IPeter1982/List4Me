using List4Me.Api.Domain;

namespace List4Me.Api.Data.Seed;

public static class DefaultSeed
{
    public record SeedProduct(string Name, decimal? DefaultQty, string? DefaultUnit);
    public record SeedSubcategory(string Name, string IconKey, SeedProduct[] Products);
    public record SeedCategory(string Name, string IconKey, string CompletedLabel,
                               SeedSubcategory[] Subcategories, SeedProduct[] TopLevelProducts);

    public static readonly SeedCategory[] Categories =
    [
        new("Bevásárlás", "shopping-cart", "Megvettem", new[]
        {
            new SeedSubcategory("Tejtermékek", "milk", new SeedProduct[]
            {
                new("Tej", 1, "l"), new("Vaj", 250, "g"), new("Joghurt", 1, "db"),
                new("Sajt", 200, "g"), new("Tejföl", 1, "db")
            }),
            new SeedSubcategory("Pékáru", "cookie", new SeedProduct[]
            {
                new("Kenyér", 1, "db"), new("Kifli", 4, "db"), new("Zsemle", 4, "db")
            }),
            new SeedSubcategory("Zöldség-gyümölcs", "apple", new SeedProduct[]
            {
                new("Alma", 1, "kg"), new("Banán", 1, "kg"), new("Paradicsom", 1, "kg"),
                new("Uborka", 500, "g"), new("Krumpli", 2, "kg"), new("Hagyma", 1, "kg")
            }),
            new SeedSubcategory("Húsáru", "beef", new SeedProduct[]
            {
                new("Csirkemell", 500, "g"), new("Sertés karaj", 500, "g")
            })
        }, Array.Empty<SeedProduct>()),

        new("Hűtő", "refrigerator", "Elfogyott", Array.Empty<SeedSubcategory>(), new SeedProduct[]
        {
            new("Tej", 1, "l"), new("Vaj", null, null), new("Joghurt", null, null),
            new("Sajt", null, null), new("Sonka", null, null)
        }),

        new("Fagyasztó", "snowflake", "Elfogyott", Array.Empty<SeedSubcategory>(), new SeedProduct[]
        {
            new("Fagyasztott zöldség", null, null), new("Fagyasztott gyümölcs", null, null),
            new("Fagyi", null, null), new("Pizza", null, null)
        }),

        new("Nyaralás", "palm-tree", "Bepakolva", new[]
        {
            new SeedSubcategory("Ruházat", "shirt", new SeedProduct[]
            {
                new("Póló", 5, "db"), new("Rövidnadrág", 3, "db"), new("Fürdőruha", 2, "db")
            }),
            new SeedSubcategory("Higiénia", "shower-head", new SeedProduct[]
            {
                new("Fogkefe", 1, "db"), new("Fogkrém", 1, "db"), new("Naptej", 1, "db")
            }),
            new SeedSubcategory("Dokumentumok", "briefcase", new SeedProduct[]
            {
                new("Útlevél", null, null), new("Jogosítvány", null, null),
                new("Biztosítás", null, null)
            })
        }, Array.Empty<SeedProduct>())
    ];

    public static void Apply(AppDbContext db, Guid householdId)
    {
        var now = DateTimeOffset.UtcNow;
        int sort = 0;
        foreach (var seed in Categories)
        {
            var cat = new Category
            {
                Id = Guid.NewGuid(),
                HouseholdId = householdId,
                Name = seed.Name,
                IconKey = seed.IconKey,
                CompletedLabel = seed.CompletedLabel,
                SortOrder = sort++,
                CreatedAt = now,
                UpdatedAt = now
            };
            db.Categories.Add(cat);

            int subSort = 0;
            foreach (var sub in seed.Subcategories)
            {
                var subCat = new Category
                {
                    Id = Guid.NewGuid(),
                    HouseholdId = householdId,
                    Name = sub.Name,
                    IconKey = sub.IconKey,
                    ParentCategoryId = cat.Id,
                    CompletedLabel = seed.CompletedLabel,
                    SortOrder = subSort++,
                    CreatedAt = now, UpdatedAt = now
                };
                db.Categories.Add(subCat);
                foreach (var p in sub.Products)
                {
                    db.Products.Add(new Product
                    {
                        Id = Guid.NewGuid(), CategoryId = subCat.Id,
                        Name = p.Name, DefaultQuantity = p.DefaultQty, DefaultUnit = p.DefaultUnit,
                        CreatedAt = now, UpdatedAt = now
                    });
                }
            }
            foreach (var p in seed.TopLevelProducts)
            {
                db.Products.Add(new Product
                {
                    Id = Guid.NewGuid(), CategoryId = cat.Id,
                    Name = p.Name, DefaultQuantity = p.DefaultQty, DefaultUnit = p.DefaultUnit,
                    CreatedAt = now, UpdatedAt = now
                });
            }
        }
    }
}
