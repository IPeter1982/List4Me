using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace List4Me.Tests.Integration.Fixtures;

public class FakeAuthOptions : AuthenticationSchemeOptions { }

public class FakeJwtAuthHandler(
    IOptionsMonitor<FakeAuthOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<FakeAuthOptions>(options, logger, encoder)
{
    public const string SchemeName = "FakeJwt";
    public const string UserHeader = "X-Test-User-Sub";
    public const string EmailHeader = "X-Test-User-Email";
    public const string NameHeader = "X-Test-User-Name";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(UserHeader, out var sub) || string.IsNullOrEmpty(sub))
            return Task.FromResult(AuthenticateResult.NoResult());

        var claims = new List<Claim> { new("sub", sub!) };
        if (Request.Headers.TryGetValue(EmailHeader, out var email))
            claims.Add(new Claim("email", email!));
        if (Request.Headers.TryGetValue(NameHeader, out var name))
            claims.Add(new Claim("name", name!));

        var identity = new ClaimsIdentity(claims, SchemeName);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
