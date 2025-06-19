export interface NormalizedData {
  [key: string]: number;
}

export interface EngineResult {
  normalized: NormalizedData;
  overall: number;
}

/**
 * Normalize metrics to a 0-1 scale and calculate an overall average.
 */
export function runEngine(data: Record<string, number>): EngineResult {
  const normalized: NormalizedData = {};
  const keys = Object.keys(data);
  let total = 0;
  for (const key of keys) {
    const value = data[key];
    const norm = value / 100;
    normalized[key] = norm;
    total += norm;
  }
  const overall = keys.length ? total / keys.length : 0;
  return { normalized, overall };
}
