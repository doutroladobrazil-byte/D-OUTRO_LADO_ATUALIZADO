import type { WeightRange } from "../types/domain.js";

export const WEIGHT_RANGES: WeightRange[] = ["100g-1kg", "1-3kg", "3-5kg", "5-10kg", "10-15kg", "15-20kg"];

export const weightRangeUpperBoundsKg: Record<WeightRange, number> = {
  "100g-1kg": 1,
  "1-3kg": 3,
  "3-5kg": 5,
  "5-10kg": 10,
  "10-15kg": 15,
  "15-20kg": 20
};
