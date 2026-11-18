// Everything a team member might want to tweak without touching components.

export const store = {
  name: "Campus Basket",
  tagline: "Farm-gate groceries for students",
  currency: "GH₵", // change to "$", "₦", "KSh", ... if needed
  supportPhone: "020 000 0000",
  supportWhatsApp: "https://wa.me/233200000000",
};

/**
 * The weekly "drop": the team collects orders until the cutoff, buys wholesale
 * from farms the next morning, and students pick up on pickup day.
 * Weekday: 0 = Sunday ... 6 = Saturday.
 */
export const drop = {
  cutoffWeekday: 4, // Thursday
  cutoffHour: 20, // 8pm
  cutoffLabel: "Thursday 8pm", // keep in sync with the two lines above
  pickupWeekday: 6, // Saturday
  pickupWindow: "10am – 2pm",
};

export const pickupPoints = [
  { id: "library", name: "Main Library forecourt", hint: "Under the big neem tree" },
  { id: "sub", name: "Student Union Building", hint: "Ground floor, by the ATMs" },
  { id: "halls", name: "Halls junction", hint: "Next to the shuttle stop" },
] as const;

export const paymentMethods = [
  { id: "momo", name: "Mobile Money at pickup", hint: "Scan or send when you collect" },
  { id: "cash", name: "Cash at pickup", hint: "Exact change helps us move fast" },
] as const;

export const categories = [
  { id: "boxes", name: "Boxes", blurb: "Pre-packed weekly bundles" },
  { id: "veg", name: "Vegetables", blurb: "Picked this week" },
  { id: "fruit", name: "Fruit", blurb: "Snacks that aren't crisps" },
  { id: "grains", name: "Grains & Staples", blurb: "Bulk-bought, split for you" },
  { id: "protein", name: "Eggs & Protein", blurb: "Straight from the pen" },
  { id: "pantry", name: "Pantry", blurb: "Oil, spices, the basics" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type PickupPointId = (typeof pickupPoints)[number]["id"];
export type PaymentMethodId = (typeof paymentMethods)[number]["id"];
