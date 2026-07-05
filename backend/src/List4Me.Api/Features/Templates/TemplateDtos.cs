using FluentValidation;

namespace List4Me.Api.Features.Templates;

public record TemplateSummaryDto(
    Guid Id,
    Guid CategoryId,
    string Name,
    Guid CreatedByMemberId,
    int ItemCount,
    DateTimeOffset CreatedAt);

public record TemplateItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    decimal? Quantity,
    string? Unit,
    string? Note,
    int SortOrder);

public record TemplateDetailDto(
    Guid Id,
    Guid CategoryId,
    string Name,
    Guid CreatedByMemberId,
    DateTimeOffset CreatedAt,
    IReadOnlyList<TemplateItemDto> Items);

public record CreateTemplateRequest(
    string Name,
    Guid CategoryId,
    Guid? SourceListId);

public class CreateTemplateValidator : AbstractValidator<CreateTemplateRequest>
{
    public CreateTemplateValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}
