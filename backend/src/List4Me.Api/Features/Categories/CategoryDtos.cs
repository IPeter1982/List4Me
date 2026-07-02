namespace List4Me.Api.Features.Categories;

public record CategoryDto(
    Guid Id,
    string Name,
    string IconKey,
    Guid? ParentCategoryId,
    string CompletedLabel,
    int SortOrder,
    IReadOnlyList<CategoryDto> Subcategories);

public record CreateCategoryRequest(
    string Name,
    string IconKey,
    Guid? ParentCategoryId,
    string? CompletedLabel);

public record UpdateCategoryRequest(
    string Name,
    string IconKey,
    string CompletedLabel,
    int? SortOrder);
