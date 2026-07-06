using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.TestOnly;

public static class TestResetHandler
{
    public static async Task<IResult> Handle(AppDbContext db)
    {
        await db.Database.EnsureDeletedAsync();
        await db.Database.MigrateAsync();
        return Results.NoContent();
    }
}
