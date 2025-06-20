import {
  collectPullRequests as defaultCollectPullRequests,
  calculateMetrics as defaultCalculateMetrics,
  calculateCycleTime as defaultCalculateCycleTime,
  calculateReviewMetrics as defaultReviewMetrics,
} from '@scorecard/scorecard-git';
import {
  fetchApiData as defaultFetchApiData,
  type FetchApiOptions,
} from '@scorecard/scorecard-api';

export interface GitFunctions {
  collectPullRequests: typeof defaultCollectPullRequests;
  calculateMetrics: typeof defaultCalculateMetrics;
  calculateCycleTime: typeof defaultCalculateCycleTime;
  calculateReviewMetrics: typeof defaultReviewMetrics;
}

export interface ScorecardDependencies {
  fetchApiData?: typeof defaultFetchApiData;
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

export async function createScorecard(options: ScorecardOptions): Promise<ScorecardResult> {
  const { git: gitRepos = [], apis = [], scorecard, deps = {} } = options;

  const fetchFn = deps.fetchApiData ?? defaultFetchApiData;
  const gitFns: GitFunctions = deps.git ?? {
    collectPullRequests: defaultCollectPullRequests,
    calculateMetrics: defaultCalculateMetrics,
    calculateCycleTime: defaultCalculateCycleTime,
    calculateReviewMetrics: defaultReviewMetrics,
  };

  const results: Record<string, any> = {};

  // Process git repositories
  for (const spec of gitRepos) {
    if (spec.provider !== 'github') continue;
    const [owner, repo] = spec.repo.split('/');
    const prs = await gitFns
      .collectPullRequests({
        owner,
        repo,
        since: spec.since ?? new Date(0).toISOString(),
        auth: spec.token ?? '',
        baseUrl: spec.baseUrl,
        includeLabels: spec.includeLabels,
        excludeLabels: spec.excludeLabels,
      })
      .catch(() => [] as unknown[]);

    const metrics = gitFns.calculateMetrics(prs as any);
    const cycleTimes: number[] = [];
    const pickupTimes: number[] = [];
    for (const pr of prs as any[]) {
      try {
        cycleTimes.push(gitFns.calculateCycleTime(pr));
      } catch {
        cycleTimes.push(0);
      }
      try {
        pickupTimes.push(gitFns.calculateReviewMetrics(pr));
      } catch {
        pickupTimes.push(0);
      }
    }
    const cycleTime = cycleTimes.reduce((a, b) => a + b, 0) / (cycleTimes.length || 1);
    const pickupTime = pickupTimes.reduce((a, b) => a + b, 0) / (pickupTimes.length || 1);
    results[spec.key] = { cycleTime, pickupTime, ...metrics };
  }

  // Process APIs
  for (const api of apis) {
    const data = await fetchFn(api.url, api.options).catch(() => undefined);
    results[api.key] = typeof api.callback === 'function' ? api.callback(data) : data;
  }

  // Calculate scores
  const scores: Record<string, number> = {};
  let sum = 0;
  let totalWeight = 0;
  for (const entry of scorecard.scores) {
    const val = entry.score(results[entry.key]);
    scores[entry.key] = val * entry.weight;
    sum += scores[entry.key];
    totalWeight += entry.weight;
  }

  const overall = totalWeight ? sum / totalWeight : 0;

  return {
    name: scorecard.name,
    description: scorecard.description,
    version: scorecard.version,
    results,
    scores,
    overall,
  };
}

if (require.main === module) {
  console.log('Run the examples to see usage.');
}
