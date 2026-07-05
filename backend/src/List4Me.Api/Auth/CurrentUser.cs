using System.Security.Claims;

namespace List4Me.Api.Auth;

/// <summary>Auth0 user identity (sub claim + email/name if present).</summary>
public record CurrentUser(string Auth0UserId, string? Email, string? DisplayName)
{
    public static CurrentUser FromPrincipal(ClaimsPrincipal p)
    {
        var sub = p.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? p.FindFirst("sub")?.Value
               ?? throw new InvalidOperationException("Missing sub claim");
        var email = p.FindFirst("email")?.Value ?? p.FindFirst(ClaimTypes.Email)?.Value;
        var name = p.FindFirst("name")?.Value ?? p.FindFirst(ClaimTypes.Name)?.Value ?? email;
        return new CurrentUser(sub, email, name);
    }
}
