using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Api.Features.Lists;
using List4Me.Api.Features.Products;
using List4Me.Api.Features.Templates;

namespace List4Me.Api.Realtime;

public interface IRealtimeNotifier
{
    Task ListCreated(Guid householdId, ListDetailDto list);
    Task ListUpdated(Guid householdId, ListDetailDto list);
    Task ListDeleted(Guid householdId, Guid listId);

    Task ListItemCreated(Guid householdId, Guid listId, ListItemDto item);
    Task ListItemUpdated(Guid householdId, Guid listId, ListItemDto item);
    Task ListItemDeleted(Guid householdId, Guid listId, Guid itemId);
    Task ListItemCompleted(Guid householdId, Guid listId, Guid itemId, Guid completedByMemberId);
    Task ListItemUncompleted(Guid householdId, Guid listId, Guid itemId);

    Task CategoryCreated(Guid householdId, CategoryDto category);
    Task CategoryUpdated(Guid householdId, CategoryDto category);
    Task CategoryDeleted(Guid householdId, Guid categoryId);

    Task ProductCreated(Guid householdId, ProductDto product);
    Task ProductUpdated(Guid householdId, ProductDto product);
    Task ProductDeleted(Guid householdId, Guid categoryId, Guid productId);
    Task ProductFavoriteChanged(Guid householdId, Guid memberId, Guid productId, bool isFavorite);

    Task TemplateCreated(Guid householdId, TemplateSummaryDto template);
    Task TemplateDeleted(Guid householdId, Guid templateId);

    Task MemberJoined(Guid householdId, HouseholdMemberDto member);
    Task MemberRemoved(Guid householdId, Guid memberId);
}
