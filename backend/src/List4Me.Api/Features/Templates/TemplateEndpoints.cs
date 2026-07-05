using List4Me.Api.Common;

namespace List4Me.Api.Features.Templates;

public static class TemplateEndpoints
{
    public static IEndpointRouteBuilder MapTemplates(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/templates").RequireAuthorization();
        g.MapGet("/", ListTemplates.Handle);
        return app;
    }
}
