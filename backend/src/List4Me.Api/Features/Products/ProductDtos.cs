using FluentValidation;

namespace List4Me.Api.Features.Products;

public record ProductDto(
    Guid Id,
    Guid CategoryId,
    string Name,
    decimal? DefaultQuantity,
    string? DefaultUnit,
    bool IsFavorite);

public record CreateProductRequest(
    string Name,
    decimal? DefaultQuantity,
    string? DefaultUnit);

public record UpdateProductRequest(
    string Name,
    decimal? DefaultQuantity,
    string? DefaultUnit);

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.DefaultQuantity!.Value).GreaterThan(0)
            .When(x => x.DefaultQuantity.HasValue);
        RuleFor(x => x.DefaultUnit!).MaximumLength(20)
            .When(x => !string.IsNullOrEmpty(x.DefaultUnit));
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.DefaultQuantity!.Value).GreaterThan(0)
            .When(x => x.DefaultQuantity.HasValue);
        RuleFor(x => x.DefaultUnit!).MaximumLength(20)
            .When(x => !string.IsNullOrEmpty(x.DefaultUnit));
    }
}
