using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.TestOnly;

public static class TestResetHandler
{
    // TRUNCATE avoids "database is in use" errors that would come from
    // EnsureDeleted+Migrate against a running backend that already holds pool
    // connections. Tables are listed in an order + CASCADE so FKs release cleanly.
    private const string TruncateSql =
        """
        TRUNCATE TABLE
            "FavoriteProducts",
            "ListTemplateItems",
            "ListTemplates",
            "ListItems",
            "Lists",
            "Products",
            "Categories",
            "HouseholdInvites",
            "HouseholdMembers",
            "Households"
        RESTART IDENTITY CASCADE;
        """;

    public static async Task<IResult> Handle(AppDbContext db)
    {
        // Ensure migrations are applied (first call on a fresh DB may need it).
        await db.Database.MigrateAsync();
        await db.Database.ExecuteSqlRawAsync(TruncateSql);
        return Results.NoContent();
    }
}
