import type { FetchApiOptions } from '@scorecard/scorecard-api';
import type {
  collectPullRequests as Collect,
  calculateMetrics as CalcMetrics,
  calculateCycleTime as CycleTime,
  calculateReviewMetrics as ReviewMetrics,
} from '@scorecard/scorecard-git';

export interface GitFunctions {
  collectPullRequests: typeof Collect;
  calculateMetrics: typeof CalcMetrics;
  calculateCycleTime: typeof CycleTime;
  calculateReviewMetrics: typeof ReviewMetrics;
}

export interface ScorecardDependencies {
  fetchApiData?: (url: string, options?: FetchApiOptions) => Promise<any>;
  git?: GitFunctions;
}

export interface GitRepoSpec {
  key: string;
  repo: string;
  provider: string;
  token?: string;
  since?: string;
  baseUrl?: string;
  includeLabels?: string[];
  excludeLabels?: string[];
}

export interface ApiSpec {
  key: string;
  url: string;
  options?: FetchApiOptions;
  callback?: (data: any) => any;
}

export interface ScoreEntry {
  key: string;
  weight: number;
  description?: string;
  score: (data: any) => number;
}

export interface ScorecardSpec {
  name: string;
  description?: string;
  version?: string;
  scores: ScoreEntry[];
}

export interface ScorecardOptions {
  git?: GitRepoSpec[];
  apis?: ApiSpec[];
  scorecard: ScorecardSpec;
  deps?: ScorecardDependencies;
}

export interface ScorecardResult {
  name: string;
  description?: string;
  version?: string;
  results: Record<string, any>;
  scores: Record<string, number>;
  overall: number;
}

export function createScorecard(options: ScorecardOptions): Promise<ScorecardResult>;
