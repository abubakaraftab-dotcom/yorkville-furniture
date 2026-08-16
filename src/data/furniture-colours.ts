export const DEFAULT_COLOUR_ID = "same-as-image";

export const furnitureColours = [
  { id: "smoke-wood", name: "Smoke Wood", hex: "#6B533E" },
  { id: "red", name: "Red", hex: "#B82323" },
  { id: "black", name: "Black", hex: "#1C1C1C" },
  { id: "silver", name: "Silver", hex: "#D3D6DB" },
  { id: "dhwani", name: "Dhwani", hex: "#3B3533" },
  { id: "shadow-oak", name: "Shadow Oak", hex: "#26211E" },
  { id: "oak", name: "Oak", hex: "#A87640" },
  { id: "auburn", name: "Auburn", hex: "#8F3D18" },
  { id: "oakwood", name: "Oakwood", hex: "#C5BDB1" },
  { id: "pink", name: "Bright Pink", hex: "#FF4081" },
  { id: "chocolate", name: "Chocolate", hex: "#301D17" },
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "loft", name: "Loft", hex: "#423129" },
  { id: "maple", name: "Maple", hex: "#E5D0A6" },
  { id: "almond", name: "Almond", hex: "#EAE6D0" },
  { id: "cherry", name: "Cherry", hex: "#4E2728" },
] as const;

export type FurnitureColour = (typeof furnitureColours)[number];

export const sameAsImageColour = {
  id: DEFAULT_COLOUR_ID,
  name: "Default / As shown in image",
  hex: "#9B8C7B",
};

export function getFurnitureColour(id: string) {
  return furnitureColours.find((colour) => colour.id === id) ?? sameAsImageColour;
}
