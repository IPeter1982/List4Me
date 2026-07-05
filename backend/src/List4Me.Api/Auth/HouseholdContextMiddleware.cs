using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Auth;

public class HouseholdContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, AppDbContext db, HouseholdContext hc)
    {
        if (ctx.User.Identity?.IsAuthenticated == true)
        {
            var user = CurrentUser.FromPrincipal(ctx.User);
            hc.User = user;
            hc.Member = await db.HouseholdMembers
                .FirstOrDefaultAsync(m => m.Auth0UserId == user.Auth0UserId);
        }
        await next(ctx);
    }
}
