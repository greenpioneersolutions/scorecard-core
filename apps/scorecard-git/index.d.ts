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
  reviewCounts: Record<number, number>;
}
export function getGitMetrics(
  repo: string,
  token?: string
): Promise<GitMetrics>;
