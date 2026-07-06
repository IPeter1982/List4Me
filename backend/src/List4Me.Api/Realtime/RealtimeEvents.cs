namespace List4Me.Api.Realtime;

public static class RealtimeEvents
{
    public const string ListCreated = "list.created";
    public const string ListUpdated = "list.updated";
    public const string ListDeleted = "list.deleted";

    public const string ListItemCreated = "listItem.created";
    public const string ListItemUpdated = "listItem.updated";
    public const string ListItemDeleted = "listItem.deleted";
    public const string ListItemCompleted = "listItem.completed";
    public const string ListItemUncompleted = "listItem.uncompleted";

    public const string CategoryCreated = "category.created";
    public const string CategoryUpdated = "category.updated";
    public const string CategoryDeleted = "category.deleted";

    public const string ProductCreated = "product.created";
    public const string ProductUpdated = "product.updated";
    public const string ProductDeleted = "product.deleted";
    public const string ProductFavoriteChanged = "product.favoriteChanged";

    public const string TemplateCreated = "template.created";
    public const string TemplateDeleted = "template.deleted";

    public const string MemberJoined = "member.joined";
    public const string MemberRemoved = "member.removed";
}
