using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Realtime;

[Authorize]
public class HouseholdHub(AppDbContext db) : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (Context.User is null)
        {
            Context.Abort();
            return;
        }

        var currentUser = CurrentUser.FromPrincipal(Context.User);
        var member = await db.HouseholdMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Auth0UserId == currentUser.Auth0UserId);
        if (member is null)
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, member.HouseholdId.ToString());
        await base.OnConnectedAsync();
    }
}
