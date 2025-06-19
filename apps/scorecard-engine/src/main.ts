export function normalizeData(
  data: Record<string, number>,
  ranges: Record<string, { min: number; max: number }>
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const key of Object.keys(data)) {
    const { min, max } = ranges[key] || { min: 0, max: 1 };
    const value = data[key];
    const norm = (value - min) / (max - min);
    result[key] = Math.min(1, Math.max(0, norm));
  }
  return result;
}

export function calculateScore(
  normalized: Record<string, number>,
  weights: Record<string, number>
): { scores: Record<string, number>; overall: number } {
  const scores: Record<string, number> = {};
  let totalWeight = 0;
  let sum = 0;
  for (const key of Object.keys(normalized)) {
    const weight = weights[key] ?? 1;
    const value = normalized[key];
    scores[key] = value * weight;
    sum += scores[key];
    totalWeight += weight;
  }
  const overall = totalWeight ? sum / totalWeight : 0;
  return { scores, overall };
}

if (require.main === module) {
  const norm = normalizeData({ a: 5 }, { a: { min: 0, max: 10 } });
  console.log(calculateScore(norm, { a: 1 }));
}
