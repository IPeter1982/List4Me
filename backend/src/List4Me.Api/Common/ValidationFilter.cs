using FluentValidation;

namespace List4Me.Api.Common;

public class ValidationFilter<T>(IValidator<T> validator) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        var arg = ctx.Arguments.OfType<T>().FirstOrDefault();
        if (arg is null) return Results.Problem("Missing body", statusCode: 400);
        var result = await validator.ValidateAsync(arg);
        if (!result.IsValid)
        {
            var errors = result.Errors.GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Results.ValidationProblem(errors);
        }
        return await next(ctx);
    }
}
