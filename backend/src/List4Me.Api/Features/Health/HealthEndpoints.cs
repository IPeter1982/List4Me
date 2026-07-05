using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Health;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealth(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", async (AppDbContext db) =>
        {
            try
            {
                await db.Database.ExecuteSqlRawAsync("SELECT 1");
                return Results.Ok(new { status = "ok" });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message, statusCode: 503);
            }
        }).AllowAnonymous();
        return app;
    }
}
