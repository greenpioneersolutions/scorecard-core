export function normalizeData(
  data: Record<string, number>,
  ranges: Record<string, { min: number; max: number }>
): Record<string, number>;
export function calculateScore(
  normalized: Record<string, number>,
  weights: Record<string, number>
): { scores: Record<string, number>; overall: number };
