import type { FetchApiOptions } from '@scorecard/scorecard-api';
import type {
  collectPullRequests as Collect,
  calculateMetrics as CalcMetrics,
  calculateCycleTime as CycleTime,
  calculateReviewMetrics as ReviewMetrics,
} from '@scorecard/scorecard-git';
import type {
  normalizeData as Normalize,
  calculateScore as Score,
} from '@scorecard/scorecard-engine';

export interface ApiSpec {
  url: string;
  options?: FetchApiOptions;
}

export interface GitFunctions {
  collectPullRequests: typeof Collect;
  calculateMetrics: typeof CalcMetrics;
  calculateCycleTime: typeof CycleTime;
  calculateReviewMetrics: typeof ReviewMetrics;
}

export interface EngineFunctions {
  normalizeData: typeof Normalize;
  calculateScore: typeof Score;
}

export interface ScorecardDependencies {
  fetchApiData?: (url: string, options?: FetchApiOptions) => Promise<any>;
  git?: GitFunctions;
  engine?: EngineFunctions;
}

export interface ScorecardOptions {
  repo?: string;
  apis?: ApiSpec[];
  /** @deprecated use `apis` */
  apiUrl?: string;
  /** @deprecated use `apis` */
  apiParams?: Record<string, any>;
  staticMetrics?: Record<string, number>;
  ranges: Record<string, { min: number; max: number }>;
  weights: Record<string, number>;
  token?: string;
  deps?: ScorecardDependencies;
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
