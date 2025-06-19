export { collectPullRequests, PartialResultsError } from './src/collectors/pullRequests.js';
export type { RawPullRequest, RawAuthor, RawReview, RawComment, RawCommit, RawCheckSuite, CollectPullRequestsParams } from './src/collectors/pullRequests.js';

export { calculateCycleTime } from './src/calculators/cycleTime.js';
export { calculateReviewMetrics } from './src/calculators/reviewMetrics.js';
export { calculateMetrics } from './src/calculators/metrics.js';
export type { CalculatedMetrics, MetricsOptions } from './src/calculators/metrics.js';
export { calculateCiMetrics } from './src/calculators/ciMetrics.js';
export type { CiMetrics } from './src/calculators/ciMetrics.js';

export { runCli } from './src/cli.js';
export { register as registerMetric } from './src/plugins/registry.js';
