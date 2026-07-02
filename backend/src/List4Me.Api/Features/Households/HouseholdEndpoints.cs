using List4Me.Api.Common;

namespace List4Me.Api.Features.Households;

public static class HouseholdEndpoints
{
    public static IEndpointRouteBuilder MapHouseholds(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/households").RequireAuthorization();

        group.MapPost("/", CreateHousehold.Handle)
             .AddEndpointFilter<ValidationFilter<CreateHouseholdRequest>>();

        return app;
    }
}
