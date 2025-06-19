export interface ScorecardOptions {
  repo: string;
  apiUrl: string;
  apiParams?: Record<string, any>;
  staticMetrics?: Record<string, number>;
  ranges: Record<string, { min: number; max: number }>;
  weights: Record<string, number>;
  token?: string;
}
export interface ScorecardResult {
  metrics: Record<string, number>;
  normalized: Record<string, number>;
  scores: Record<string, number>;
  overall: number;
}
export function createScorecard(
  options: ScorecardOptions
): Promise<ScorecardResult>;
