using List4Me.Api.Common;

namespace List4Me.Api.Features.Categories;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategories(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/categories").RequireAuthorization();
        g.MapGet("/", ListCategories.Handle);
        g.MapPost("/", CreateCategory.Handle)
         .AddEndpointFilter<ValidationFilter<CreateCategoryRequest>>();
        return app;
    }
}
