using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Api.Features.Lists;
using List4Me.Api.Features.Products;
using List4Me.Api.Features.Templates;
using Microsoft.AspNetCore.SignalR;

namespace List4Me.Api.Realtime;

public class RealtimeNotifier(IHubContext<HouseholdHub> hub) : IRealtimeNotifier
{
    private IClientProxy Group(Guid householdId) =>
        hub.Clients.Group(householdId.ToString());

    public Task ListCreated(Guid h, ListDetailDto l) =>
        Group(h).SendAsync(RealtimeEvents.ListCreated, l);
    public Task ListUpdated(Guid h, ListDetailDto l) =>
        Group(h).SendAsync(RealtimeEvents.ListUpdated, l);
    public Task ListDeleted(Guid h, Guid id) =>
        Group(h).SendAsync(RealtimeEvents.ListDeleted, new { listId = id });

    public Task ListItemCreated(Guid h, Guid lid, ListItemDto i) =>
        Group(h).SendAsync(RealtimeEvents.ListItemCreated, new { listId = lid, item = i });
    public Task ListItemUpdated(Guid h, Guid lid, ListItemDto i) =>
        Group(h).SendAsync(RealtimeEvents.ListItemUpdated, new { listId = lid, item = i });
    public Task ListItemDeleted(Guid h, Guid lid, Guid iid) =>
        Group(h).SendAsync(RealtimeEvents.ListItemDeleted, new { listId = lid, itemId = iid });
    public Task ListItemCompleted(Guid h, Guid lid, Guid iid, Guid by) =>
        Group(h).SendAsync(RealtimeEvents.ListItemCompleted,
            new { listId = lid, itemId = iid, completedByMemberId = by });
    public Task ListItemUncompleted(Guid h, Guid lid, Guid iid) =>
        Group(h).SendAsync(RealtimeEvents.ListItemUncompleted,
            new { listId = lid, itemId = iid });

    public Task CategoryCreated(Guid h, CategoryDto c) =>
        Group(h).SendAsync(RealtimeEvents.CategoryCreated, c);
    public Task CategoryUpdated(Guid h, CategoryDto c) =>
        Group(h).SendAsync(RealtimeEvents.CategoryUpdated, c);
    public Task CategoryDeleted(Guid h, Guid id) =>
        Group(h).SendAsync(RealtimeEvents.CategoryDeleted, new { categoryId = id });

    public Task ProductCreated(Guid h, ProductDto p) =>
        Group(h).SendAsync(RealtimeEvents.ProductCreated, p);
    public Task ProductUpdated(Guid h, ProductDto p) =>
        Group(h).SendAsync(RealtimeEvents.ProductUpdated, p);
    public Task ProductDeleted(Guid h, Guid catId, Guid pid) =>
        Group(h).SendAsync(RealtimeEvents.ProductDeleted, new { categoryId = catId, productId = pid });
    public Task ProductFavoriteChanged(Guid h, Guid memberId, Guid pid, bool fav) =>
        Group(h).SendAsync(RealtimeEvents.ProductFavoriteChanged,
            new { memberId, productId = pid, isFavorite = fav });

    public Task TemplateCreated(Guid h, TemplateSummaryDto t) =>
        Group(h).SendAsync(RealtimeEvents.TemplateCreated, t);
    public Task TemplateDeleted(Guid h, Guid id) =>
        Group(h).SendAsync(RealtimeEvents.TemplateDeleted, new { templateId = id });

    public Task MemberJoined(Guid h, HouseholdMemberDto m) =>
        Group(h).SendAsync(RealtimeEvents.MemberJoined, m);
    public Task MemberRemoved(Guid h, Guid id) =>
        Group(h).SendAsync(RealtimeEvents.MemberRemoved, new { memberId = id });
}
