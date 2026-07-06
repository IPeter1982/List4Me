using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace List4Me.Api.Features.TestOnly;

public record LoginAsRequest(string Auth0UserId, string? Email, string? Name);
public record LoginAsResponse(string AccessToken);

public static class TestLoginAsHandler
{
    public const string TestAudience = "list4me-test";
    private const string DefaultSigningKey = "test-signing-key-must-be-at-least-32-bytes-long!!";

    public static IResult Handle(LoginAsRequest req, IConfiguration cfg)
    {
        var keyMaterial = cfg["Test:SigningKey"] ?? DefaultSigningKey;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyMaterial));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new("sub", req.Auth0UserId),
            new("name", req.Name ?? req.Auth0UserId)
        };
        if (!string.IsNullOrEmpty(req.Email)) claims.Add(new Claim("email", req.Email));

        var token = new JwtSecurityToken(
            audience: TestAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);
        return Results.Ok(new LoginAsResponse(new JwtSecurityTokenHandler().WriteToken(token)));
    }
}
