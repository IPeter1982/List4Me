using List4Me.Api.Common;

namespace List4Me.Api.Features.Products;

public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProducts(this IEndpointRouteBuilder app)
    {
        var byCategory = app.MapGroup("/api/categories/{categoryId:guid}/products").RequireAuthorization();
        byCategory.MapGet("/", ListProducts.Handle);
        // Handlers wired progressively in tasks B2, B3.

        var byId = app.MapGroup("/api/products/{id:guid}").RequireAuthorization();
        // Handlers wired in tasks B4-B6.
        return app;
    }
}
