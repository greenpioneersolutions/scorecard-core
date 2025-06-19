import {
  collectPullRequests as defaultCollectPullRequests,
  calculateMetrics as defaultCalculateMetrics,
  calculateCycleTime as defaultCalculateCycleTime,
  calculateReviewMetrics as defaultCalculateReviewMetrics,
} from '@scorecard/scorecard-git';
import {
  fetchApiData as defaultFetchApiData,
  type FetchApiOptions,
} from '@scorecard/scorecard-api';
import {
  normalizeData as defaultNormalizeData,
  calculateScore as defaultCalculateScore,
} from '@scorecard/scorecard-engine';

export interface ApiSpec {
  url: string;
  options?: FetchApiOptions;
}

export interface GitFunctions {
  collectPullRequests: typeof defaultCollectPullRequests;
  calculateMetrics: typeof defaultCalculateMetrics;
  calculateCycleTime: typeof defaultCalculateCycleTime;
  calculateReviewMetrics: typeof defaultCalculateReviewMetrics;
}

export interface EngineFunctions {
  normalizeData: typeof defaultNormalizeData;
  calculateScore: typeof defaultCalculateScore;
}

export interface ScorecardDependencies {
  fetchApiData?: typeof defaultFetchApiData;
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

export async function createScorecard(
  options: ScorecardOptions
): Promise<ScorecardResult> {
  const {
    repo,
    apis = [],
    apiUrl,
    apiParams,
    staticMetrics = {},
    ranges,
    weights,
    token,
    deps = {},
  } = options;

  const fetchFn = deps.fetchApiData ?? defaultFetchApiData;
  const engine = deps.engine ?? {
    normalizeData: defaultNormalizeData,
    calculateScore: defaultCalculateScore,
  };
  const git = deps.git;

  const allApis: ApiSpec[] = [...apis];
  if (apiUrl) {
    allApis.push({ url: apiUrl, options: apiParams });
  }

  let gitMetrics: Record<string, number> = {};
  if (git && repo) {
    const [owner, repoName] = repo.split('/');

    const prs = await git
      .collectPullRequests({
        owner,
        repo: repoName,
        since: new Date(0).toISOString(),
        auth: token ?? '',
      })
      .catch(() => [] as unknown[]);

    const gitMetricsData = git.calculateMetrics(prs as any);

    const cycleTimes: number[] = [];
    const pickupTimes: number[] = [];
    for (const pr of prs as unknown[]) {
      try {
        cycleTimes.push(git.calculateCycleTime(pr as any));
      } catch {
        cycleTimes.push(0);
      }
      try {
        pickupTimes.push(git.calculateReviewMetrics(pr as any));
      } catch {
        pickupTimes.push(0);
      }
    }
    const cycleTime =
      cycleTimes.reduce((a, b) => a + b, 0) / (cycleTimes.length || 1);
    const pickupTime =
      pickupTimes.reduce((a, b) => a + b, 0) / (pickupTimes.length || 1);

    gitMetrics = {
      cycleTime,
      pickupTime,
      ...gitMetricsData,
    } as any;
  }

  const apiMetrics: Record<string, number> = {};
  for (const api of allApis) {
    const data = await fetchFn(api.url, api.options).catch(
      () => ({} as Record<string, any>),
    );
    if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'number') apiMetrics[k] = v;
      }
    }
  }

  const numericGitMetrics: Record<string, number> = {};
  for (const [key, value] of Object.entries(
    gitMetrics as Record<string, any>
  )) {
    if (typeof value === 'number') {
      numericGitMetrics[key] = value;
    }
  }

  const metrics: Record<string, number> = {
    ...numericGitMetrics,
    ...apiMetrics,
    ...staticMetrics,
  };
  const normalized = engine.normalizeData(metrics, ranges);
  const { scores, overall } = engine.calculateScore(normalized, weights);

  return { metrics, normalized, scores, overall };
}

if (require.main === module) {
  (async () => {
    const ranges = {
      cycleTime: { min: 0, max: 168 }, // hours
      pickupTime: { min: 0, max: 24 },
      mergeRate: { min: 0, max: 1 },
      buildSuccessRate: { min: 0, max: 1 },
    };

    const weights = {
      cycleTime: 1,
      pickupTime: 1,
      mergeRate: 1,
      buildSuccessRate: 1,
    };

    const result = await createScorecard({
      repo: 'octocat/Hello-World',
      apis: [{ url: 'https://example.com/mock' }],
      ranges,
      weights,
      deps: {
        fetchApiData: defaultFetchApiData,
        engine: { normalizeData: defaultNormalizeData, calculateScore: defaultCalculateScore },
        git: {
          collectPullRequests: defaultCollectPullRequests,
          calculateMetrics: defaultCalculateMetrics,
          calculateCycleTime: defaultCalculateCycleTime,
          calculateReviewMetrics: defaultCalculateReviewMetrics,
        },
      },
    });
    console.log(JSON.stringify(result, null, 2));
  })();
}
