import { getGitMetrics } from '@scorecard/scorecard-git';
import { fetchApiData } from '@scorecard/scorecard-api';
import { normalizeData, calculateScore } from '@scorecard/scorecard-engine';

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

export async function createScorecard(
  options: ScorecardOptions
): Promise<ScorecardResult> {
  const {
    repo,
    apiUrl,
    apiParams,
    staticMetrics = {},
    ranges,
    weights,
    token,
  } = options;

  const [gitMetrics, apiMetrics] = await Promise.all([
    getGitMetrics(repo, token).catch(() => ({} as any)),
    fetchApiData(apiUrl, apiParams).catch(() => ({} as Record<string, number>)),
  ]);

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
  const normalized = normalizeData(metrics, ranges);
  const { scores, overall } = calculateScore(normalized, weights);

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
      apiUrl: 'https://example.com/mock',
      ranges,
      weights,
    });
    console.log(JSON.stringify(result, null, 2));
  })();
}
