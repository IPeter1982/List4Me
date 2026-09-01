import {
  ShoppingCart, ShoppingBag, ForkKnife, Orange, Carrot, Cow, Fish,
  Drop, Coffee, Wine, BeerBottle, Cookie, Cake, Pizza, Hamburger,
  ThermometerCold, Snowflake, Thermometer, Flame,
  Tree, Sun, Umbrella, Tent, Backpack, Camera, Car, Airplane, SuitcaseRolling,
  Briefcase, Gift, Heart, Star,
  Pill, Syringe, Baby, Dog, Cat,
  Hammer, Wrench, Screwdriver, PaintBrush,
  Book, Pencil, Flower, Leaf,
  WashingMachine, TShirt, Sneaker,
  Bathtub, Shower,
  List, Clipboard, ClipboardText, CheckSquare,
  HouseLine, Bed, Couch, Lamp,
  Package, Stack,
  type Icon
} from "@phosphor-icons/react"

// Phosphor has no perfect equivalent for: apple, milk, beer, palm-tree, sandwich, refrigerator.
// Picks below are the closest visually-honest fallback.
export const iconRegistry: Record<string, Icon> = {
  "shopping-cart": ShoppingCart, "shopping-bag": ShoppingBag, "utensils": ForkKnife,
  "apple": Orange, "carrot": Carrot, "beef": Cow, "fish": Fish,
  "milk": Drop, "coffee": Coffee, "wine": Wine, "beer": BeerBottle,
  "cookie": Cookie, "cake": Cake, "pizza": Pizza, "sandwich": Hamburger,
  "refrigerator": ThermometerCold, "snowflake": Snowflake,
  "thermometer": Thermometer, "flame": Flame,
  "palm-tree": Tree, "sun": Sun, "umbrella": Umbrella, "tent": Tent,
  "backpack": Backpack, "camera": Camera, "car": Car, "plane": Airplane, "luggage": SuitcaseRolling,
  "briefcase": Briefcase, "gift": Gift, "heart": Heart, "star": Star,
  "pill": Pill, "syringe": Syringe, "baby": Baby, "dog": Dog, "cat": Cat,
  "hammer": Hammer, "wrench": Wrench, "screwdriver": Screwdriver, "paintbrush": PaintBrush,
  "book": Book, "pencil": Pencil, "flower": Flower, "leaf": Leaf, "trees": Tree,
  "washing-machine": WashingMachine, "shirt": TShirt, "shoe": Sneaker,
  "bath": Bathtub, "shower-head": Shower,
  "list": List, "clipboard": Clipboard, "clipboard-list": ClipboardText, "check-square": CheckSquare,
  "home": HouseLine, "bed": Bed, "sofa": Couch, "lamp": Lamp,
  "package": Package, "box": Package, "layers": Stack
}

export const iconKeys = Object.keys(iconRegistry).sort()

export function getIcon(key: string): Icon {
  return iconRegistry[key] ?? Package
}
