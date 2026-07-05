using FluentValidation;

namespace List4Me.Api.Features.Lists;

public record ListSummaryDto(
    Guid Id,
    Guid CategoryId,
    string Name,
    Guid CreatedByMemberId,
    Guid? FromTemplateId,
    int TotalItems,
    int CompletedItems,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ArchivedAt);

public record ListItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid CategoryId,
    decimal? Quantity,
    string? Unit,
    DateOnly? ExpiresOn,
    string? Note,
    bool IsCompleted,
    DateTimeOffset? CompletedAt,
    Guid? CompletedByMemberId,
    int SortOrder);

public record ListDetailDto(
    Guid Id,
    Guid CategoryId,
    string Name,
    Guid CreatedByMemberId,
    Guid? FromTemplateId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ArchivedAt,
    IReadOnlyList<ListItemDto> Items);

public record CreateListRequest(
    string Name,
    Guid CategoryId,
    Guid? FromTemplateId);

public record UpdateListRequest(string? Name, bool? Archived);

public record CreateListItemRequest(
    Guid ProductId,
    decimal? Quantity,
    string? Unit,
    DateOnly? ExpiresOn,
    string? Note);

public record UpdateListItemRequest(
    decimal? Quantity,
    string? Unit,
    DateOnly? ExpiresOn,
    string? Note);

public class CreateListValidator : AbstractValidator<CreateListRequest>
{
    public CreateListValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}

public class UpdateListValidator : AbstractValidator<UpdateListRequest>
{
    public UpdateListValidator()
    {
        RuleFor(x => x.Name!).MaximumLength(80)
            .When(x => x.Name is not null);
    }
}

public class CreateListItemValidator : AbstractValidator<CreateListItemRequest>
{
    public CreateListItemValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity!.Value).GreaterThan(0)
            .When(x => x.Quantity.HasValue);
        RuleFor(x => x.Unit!).MaximumLength(20).When(x => !string.IsNullOrEmpty(x.Unit));
        RuleFor(x => x.Note!).MaximumLength(300).When(x => !string.IsNullOrEmpty(x.Note));
    }
}

public class UpdateListItemValidator : AbstractValidator<UpdateListItemRequest>
{
    public UpdateListItemValidator()
    {
        RuleFor(x => x.Quantity!.Value).GreaterThan(0).When(x => x.Quantity.HasValue);
        RuleFor(x => x.Unit!).MaximumLength(20).When(x => !string.IsNullOrEmpty(x.Unit));
        RuleFor(x => x.Note!).MaximumLength(300).When(x => !string.IsNullOrEmpty(x.Note));
    }
}
