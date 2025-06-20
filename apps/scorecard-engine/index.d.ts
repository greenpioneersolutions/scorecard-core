export function normalizeData(
  data: Record<string, number>,
  ranges: Record<string, { min: number; max: number }>
): Record<string, number>;
export function calculateScore(
  normalized: Record<string, number>,
  weights: Record<string, number>
): { scores: Record<string, number>; overall: number };

export interface RangeRule {
  max: number;
  score: number;
}

export function createRangeNormalizer(
  ranges: RangeRule[],
  defaultScore: number
): (value: number) => number;

export interface ScoreRule<Metrics> {
  weight: number;
  metric?: keyof Metrics;
  fn?: (metrics: Metrics) => number;
  normalize?: (value: number, metrics: Metrics) => number;
}

export interface MetricScore {
  overall: number;
  [metric: string]: number;
}

export function scoreMetrics<Metrics extends Record<string, any>>(
  metrics: Metrics,
  rules: ScoreRule<Metrics>[]
): MetricScore;
