import {
  collectPullRequests as defaultCollectPullRequests,
  calculateMetrics as defaultCalculateMetrics,
  calculateCycleTime as defaultCalculateCycleTime,
  calculateReviewMetrics as defaultCalculateReviewMetrics,
} from '@scorecard/scorecard-git';
import { Command } from 'commander';
import fs from 'fs';
import yaml from 'js-yaml';
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

export interface ApiInput {
  key: string;
  url: string;
  options?: FetchApiOptions;
  callback?: (data: any) => number;
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
  fetchApiData?: typeof defaultFetchApiData;
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

export async function createScorecardLegacy(
  options: ScorecardOptions,
): Promise<ScorecardResult> {
  const {
    repos = [],
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
  const repoSpecs: RepoSpec[] = [...repos];
  if (repo) repoSpecs.push({ repo, token });

  if (git && repoSpecs.length > 0) {
    const allPrs: unknown[] = [];
    for (const spec of repoSpecs) {
      const [owner, repoName] = spec.repo.split('/');
      const prs = await git
        .collectPullRequests({
          owner,
          repo: repoName,
          since: spec.since ?? new Date(0).toISOString(),
          auth: spec.token ?? token ?? '',
          baseUrl: spec.baseUrl,
          includeLabels: spec.includeLabels,
          excludeLabels: spec.excludeLabels,
        })
        .catch(() => [] as unknown[]);
      allPrs.push(...prs);
    }

    const gitMetricsData = git.calculateMetrics(allPrs as any);

    const cycleTimes: number[] = [];
    const pickupTimes: number[] = [];
    for (const pr of allPrs as unknown[]) {
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
      () => ({}) as Record<string, any>,
    );
    if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'number') apiMetrics[k] = v;
      }
    }
  }

  const numericGitMetrics: Record<string, number> = {};
  for (const [key, value] of Object.entries(
    gitMetrics as Record<string, any>,
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

export async function createScorecard(
  input: ScorecardInput,
): Promise<ScorecardOutput> {
  const { git = [], apis = [], scorecard, deps = {} } = input;
  const fetchFn = deps.fetchApiData ?? defaultFetchApiData;
  const gitDeps = deps.git;

  const metrics: Record<string, any> = {};

  if (gitDeps) {
    for (const repo of git) {
      const [owner, repoName] = repo.repo.split('/');
      const prs = await gitDeps
        .collectPullRequests({
          owner,
          repo: repoName,
          since: repo.since ?? new Date(0).toISOString(),
          auth: repo.token ?? '',
          baseUrl: repo.baseUrl,
          includeLabels: repo.includeLabels,
          excludeLabels: repo.excludeLabels,
        })
        .catch(() => [] as unknown[]);
      const gitMetrics = gitDeps.calculateMetrics(prs as any);
      const cycleTimes: number[] = [];
      const pickupTimes: number[] = [];
      for (const pr of prs as unknown[]) {
        try {
          cycleTimes.push(gitDeps.calculateCycleTime(pr as any));
        } catch {
          cycleTimes.push(0);
        }
        try {
          pickupTimes.push(gitDeps.calculateReviewMetrics(pr as any));
        } catch {
          pickupTimes.push(0);
        }
      }
      const cycleTime =
        cycleTimes.reduce((a, b) => a + b, 0) / (cycleTimes.length || 1);
      const pickupTime =
        pickupTimes.reduce((a, b) => a + b, 0) / (pickupTimes.length || 1);
      metrics[repo.key] = {
        cycleTime,
        pickupTime,
        ...gitMetrics,
      };
    }
  }

  for (const api of apis) {
    const data = await fetchFn(api.url, api.options).catch(() => null);
    metrics[api.key] =
      typeof api.callback === 'function' ? api.callback(data) : data;
  }

  const scores: Record<string, number> = {};
  let sum = 0;
  let totalWeight = 0;
  for (const rule of scorecard.scores) {
    const value = rule.score(metrics[rule.key]);
    const weighted = typeof value === 'number' ? value * rule.weight : 0;
    scores[rule.key] = weighted;
    sum += weighted;
    totalWeight += rule.weight;
  }
  const overall = totalWeight ? sum / totalWeight : 0;

  return { metrics, scores, overall, scorecard };
}

export { createRangeNormalizer, scoreMetrics } from '@scorecard/scorecard-engine';

export async function runCli(argv = process.argv): Promise<void> {
  const program = new Command();
  program.name('scorecard').argument('<config>', 'YAML config file');
  program.parse(argv);

  const [configPath] = program.args;
  if (!configPath) {
    program.help({ error: true });
  }

  const file = fs.readFileSync(configPath, 'utf8');
  const options = (yaml.load(file) || {}) as ScorecardOptions;

  const result = await createScorecardLegacy({
    ...options,
    deps: {
      fetchApiData: defaultFetchApiData,
      engine: {
        normalizeData: defaultNormalizeData,
        calculateScore: defaultCalculateScore,
      },
      git: {
        collectPullRequests: defaultCollectPullRequests,
        calculateMetrics: defaultCalculateMetrics,
        calculateCycleTime: defaultCalculateCycleTime,
        calculateReviewMetrics: defaultCalculateReviewMetrics,
      },
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  runCli().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
