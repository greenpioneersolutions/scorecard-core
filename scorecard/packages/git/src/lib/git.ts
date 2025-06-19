export interface GitMetrics {
  cycleTime: number;
  pickupTime: number;
  mergeRate: number;
  closedWithoutMergeRate: number;
  reviewCoverage: number;
  averageCommitsPerPr: number;
  outsizedPrs: number[];
  buildSuccessRate: number;
  averageCiDuration: number;
  stalePrCount: number;
  hotfixFrequency: number;
  prBacklog: number;
  prCountPerDeveloper: Record<string, number>;
  reviewCounts: Record<string, number>;
}

/**
 * Fetch git metrics for a repository.
 * In this demo, metrics are hard-coded.
 */
export async function getGitMetrics(repo: string): Promise<GitMetrics> {
  // TODO: integrate with GitHub API
  return {
    cycleTime: 5,
    pickupTime: 2,
    mergeRate: 0.9,
    closedWithoutMergeRate: 0.1,
    reviewCoverage: 1,
    averageCommitsPerPr: 3,
    outsizedPrs: [],
    buildSuccessRate: 0.95,
    averageCiDuration: 300,
    stalePrCount: 1,
    hotfixFrequency: 0.05,
    prBacklog: 2,
    prCountPerDeveloper: { alice: 10, bob: 8 },
    reviewCounts: { pr1: 2, pr2: 1 }
  };
}
