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

export interface ApiInput {
  key: string;
  url: string;
  options?: FetchApiOptions;
  callback?: (data: any) => number;
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

export interface RepoSpec {
  repo: string;
  token?: string;
  since?: string;
  baseUrl?: string;
  includeLabels?: string[];
  excludeLabels?: string[];
}

export interface GitRepoInput extends RepoSpec {
  key: string;
  provider?: string;
}

export interface ScorecardDependencies {
  fetchApiData?: (url: string, options?: FetchApiOptions) => Promise<any>;
  git?: GitFunctions;
  engine?: EngineFunctions;
}

export interface ScoreRuleSpec {
  key: string;
  weight: number;
  description?: string;
  score: (data: any) => number;
}

export interface ScorecardSpec {
  name: string;
  description?: string;
  version?: string;
  scores: ScoreRuleSpec[];
}

export interface ScorecardOptions {
  repos?: RepoSpec[];
  /** @deprecated use `repos` */
  repo?: string;
  apis?: ApiSpec[];
  /** @deprecated use `apis` */
  apiUrl?: string;
  /** @deprecated use `apis` */
  apiParams?: Record<string, any>;
  staticMetrics?: Record<string, number>;
  ranges: Record<string, { min: number; max: number }>;
  weights: Record<string, number>;
  /** @deprecated use RepoSpec.token */
  token?: string;
  deps?: ScorecardDependencies;
}

export interface ScorecardInput {
  git?: GitRepoInput[];
  apis?: ApiInput[];
  scorecard: ScorecardSpec;
  deps?: ScorecardDependencies;
}
export interface ScorecardResult {
  metrics: Record<string, number>;
  normalized: Record<string, number>;
  scores: Record<string, number>;
  overall: number;
}

export interface ScorecardOutput {
  metrics: Record<string, any>;
  scores: Record<string, number>;
  overall: number;
  scorecard: ScorecardSpec;
}

export { createRangeNormalizer, scoreMetrics } from '@scorecard/scorecard-engine';
export function createScorecardLegacy(
  options: ScorecardOptions,
): Promise<ScorecardResult>;

export function createScorecard(
  input: ScorecardInput,
): Promise<ScorecardOutput>;
