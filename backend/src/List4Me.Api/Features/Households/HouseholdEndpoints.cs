using List4Me.Api.Common;

namespace List4Me.Api.Features.Households;

public static class HouseholdEndpoints
{
    public static IEndpointRouteBuilder MapHouseholds(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/households").RequireAuthorization();

        group.MapPost("/", CreateHousehold.Handle)
             .AddEndpointFilter<ValidationFilter<CreateHouseholdRequest>>();

        group.MapGet("/me", GetMyHousehold.Handle);
        group.MapPatch("/me", UpdateHousehold.Handle)
             .AddEndpointFilter<ValidationFilter<UpdateHouseholdRequest>>();

        return app;
    }
}
