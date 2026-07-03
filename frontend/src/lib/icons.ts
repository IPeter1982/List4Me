import {
  ShoppingCart, ShoppingBag, Utensils, Apple, Carrot, Beef, Fish,
  Milk, Coffee, Wine, Beer, Cookie, Cake, Pizza, Sandwich,
  Refrigerator, Snowflake, Thermometer, Flame,
  Palmtree, Sun, Umbrella, Tent, Backpack, Camera, Car, Plane, Luggage,
  Briefcase, Gift, Heart, Star,
  Pill, Syringe, Baby, Dog, Cat,
  Hammer, Wrench, Paintbrush,
  Book, Pencil, Flower, Leaf, Trees,
  WashingMachine, Shirt,
  Bath, ShowerHead,
  List, Clipboard, ClipboardList, CheckSquare,
  Home, Bed, Sofa, Lamp,
  Package, Box, Layers,
  type LucideIcon
} from "lucide-react"

// Note: lucide-react has no Screwdriver icon; falling back to Wrench for "screwdriver" key.
export const iconRegistry: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart, "shopping-bag": ShoppingBag, "utensils": Utensils,
  "apple": Apple, "carrot": Carrot, "beef": Beef, "fish": Fish,
  "milk": Milk, "coffee": Coffee, "wine": Wine, "beer": Beer,
  "cookie": Cookie, "cake": Cake, "pizza": Pizza, "sandwich": Sandwich,
  "refrigerator": Refrigerator, "snowflake": Snowflake,
  "thermometer": Thermometer, "flame": Flame,
  "palm-tree": Palmtree, "sun": Sun, "umbrella": Umbrella, "tent": Tent,
  "backpack": Backpack, "camera": Camera, "car": Car, "plane": Plane, "luggage": Luggage,
  "briefcase": Briefcase, "gift": Gift, "heart": Heart, "star": Star,
  "pill": Pill, "syringe": Syringe, "baby": Baby, "dog": Dog, "cat": Cat,
  "hammer": Hammer, "wrench": Wrench, "screwdriver": Wrench, "paintbrush": Paintbrush,
  "book": Book, "pencil": Pencil, "flower": Flower, "leaf": Leaf, "trees": Trees,
  "washing-machine": WashingMachine, "shirt": Shirt, "shoe": Shirt, // Lucide has no shoe icon
  "bath": Bath, "shower-head": ShowerHead,
  "list": List, "clipboard": Clipboard, "clipboard-list": ClipboardList, "check-square": CheckSquare,
  "home": Home, "bed": Bed, "sofa": Sofa, "lamp": Lamp,
  "package": Package, "box": Box, "layers": Layers
}

export const iconKeys = Object.keys(iconRegistry).sort()

export function getIcon(key: string): LucideIcon {
  return iconRegistry[key] ?? Package
}
