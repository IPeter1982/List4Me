namespace List4Me.Api.Features.Categories;

public static class IconKeys
{
    public static readonly IReadOnlySet<string> Allowed = new HashSet<string>(StringComparer.Ordinal)
    {
        "shopping-cart", "shopping-bag", "utensils", "apple", "carrot", "beef", "fish",
        "milk", "coffee", "wine", "beer", "cookie", "cake", "pizza", "sandwich",
        "refrigerator", "snowflake", "thermometer", "flame",
        "palm-tree", "sun", "umbrella", "tent", "backpack", "camera", "car", "plane", "luggage",
        "briefcase", "gift", "heart", "star",
        "pill", "syringe", "baby", "dog", "cat",
        "hammer", "wrench", "screwdriver", "paintbrush",
        "book", "pencil", "flower", "leaf", "trees",
        "washing-machine", "shirt", "shoe",
        "bath", "shower-head",
        "list", "clipboard", "clipboard-list", "check-square",
        "home", "bed", "sofa", "lamp",
        "package", "box", "layers"
    };
}
