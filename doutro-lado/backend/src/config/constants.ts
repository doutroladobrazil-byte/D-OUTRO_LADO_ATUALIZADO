import type { Brand, Region, WeightRange } from "../types/domain.js";

export const BRANDS: readonly Brand[] = ["casa", "moda"] as const;

export const REGIONS: readonly Region[] = [
  "North America",
  "Europe",
  "Middle East"
] as const;

export const WEIGHT_RANGES: readonly WeightRange[] = [
  "100g-1kg",
  "1-3kg",
  "3-5kg",
  "5-10kg",
  "10-15kg",
  "15-20kg"
] as const;

export const weightRangeUpperBoundsKg: Record<WeightRange, number> = {
  "100g-1kg": 1,
  "1-3kg": 3,
  "3-5kg": 5,
  "5-10kg": 10,
  "10-15kg": 15,
  "15-20kg": 20
};
