export const CAKE_CATEGORIES = [
  { value: "VANILLA", label: "Vanilla" },
  { value: "CHOCOLATE", label: "Chocolate" },
  { value: "RED_VELVET", label: "Red Velvet" },
  { value: "COCONUT", label: "Coconut" },
  { value: "THAI_TEA", label: "Thai Tea" },
  { value: "CHEESE_LAVA", label: "Cheese Lava" },
  { value: "RAINBOW_CREPE", label: "Rainbow Crepe" },
] as const;

export const CAKE_SIZES = [
  { value: "SIX_INCH", label: "6 လက်မ (အသေး)" },
  { value: "SEVEN_INCH", label: "7 လက်မ" },
  { value: "EIGHT_INCH", label: "8 လက်မ (အလတ်)" },
  { value: "NINE_INCH", label: "9 လက်မ" },
  { value: "TEN_INCH", label: "10 လက်မ (အကြီး)" },
  { value: "TWELVE_INCH", label: "12 လက်မ" },
  { value: "FOURTEEN_INCH", label: "14 လက်မ" },
] as const;

export const EXTRA_OPTIONS = [
  { value: "dolls", label: "အရုပ် (Dolls)" },
  { value: "toppings", label: "အပေါ်ယံများ (Toppings)" },
  { value: "fruits", label: "သီးနှံများ (Fruits)" },
  { value: "money_pulling", label: "ငွေဆွဲစနစ် (Money Pulling)" },
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "DONE",
  "CANCELLED",
] as const;

export type CakeCategoryCode = (typeof CAKE_CATEGORIES)[number]["value"];
export type CakeSizeCode = (typeof CAKE_SIZES)[number]["value"];
export type ExtraItemCode = (typeof EXTRA_OPTIONS)[number]["value"];
export type OrderStatusCode = (typeof ORDER_STATUSES)[number];

export const BASE_PRICE_TABLE: Record<CakeSizeCode, number> = {
  SIX_INCH: 15000,
  SEVEN_INCH: 20000,
  EIGHT_INCH: 25000,
  NINE_INCH: 32000,
  TEN_INCH: 40000,
  TWELVE_INCH: 60000,
  FOURTEEN_INCH: 80000,
};

export const EXTRA_PRICE_TABLE: Record<ExtraItemCode, number> = {
  dolls: 5000,
  toppings: 3000,
  fruits: 8000,
  money_pulling: 15000,
};

export const computeFees = (size: CakeSizeCode, extras: ExtraItemCode[]) => {
  const basePrice = BASE_PRICE_TABLE[size] ?? 0;
  const extraFee = extras.reduce(
    (sum, extra) => sum + (EXTRA_PRICE_TABLE[extra] ?? 0),
    0,
  );

  return {
    basePrice,
    extraFee,
    totalAmount: basePrice + extraFee,
  };
};

export const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

