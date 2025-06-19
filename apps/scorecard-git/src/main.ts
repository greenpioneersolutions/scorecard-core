import axios from 'axios';

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

const OUTSIZED_THRESHOLD = 1000;
const STALE_DAYS = 30;

async function fetchAllPRs(repo: string, headers: Record<string, string>) {
  const perPage = 100;
  let page = 1;
  const prs: any[] = [];
  while (true) {
    const { data } = await axios.get(
      `https://api.github.com/repos/${repo}/pulls`,
      {
        headers,
        params: { state: 'all', per_page: perPage, page },
      }
    );
    prs.push(...data);
    if (data.length < perPage) break;
    page += 1;
  }
  return prs;
}

export async function getGitMetrics(
  repo: string,
  token?: string
): Promise<GitMetrics> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const prs = await fetchAllPRs(repo, headers);

  let mergedCount = 0;
  let closedWithoutMerge = 0;
  let totalCommits = 0;
  const outsizedPrs: number[] = [];
  const cycleTimes: number[] = [];
  const pickupTimes: number[] = [];
  let reviewsWithComments = 0;
  let prBacklog = 0;
  let stalePrCount = 0;
  let hotfixCount = 0;
  let successfulBuilds = 0;
  let totalBuilds = 0;
  let totalCiDuration = 0;
  const reviewCounts: Record<number, number> = {};
  const prCountPerDeveloper: Record<string, number> = {};
  const now = Date.now();

  for (const pr of prs) {
    const number = pr.number;
    const { data: prDetail } = await axios.get(
      `https://api.github.com/repos/${repo}/pulls/${number}`,
      { headers }
    );
    const { data: reviews } = await axios.get(
      `https://api.github.com/repos/${repo}/pulls/${number}/reviews`,
      { headers }
    );
    reviewCounts[number] = reviews.length;
    if (reviews.length) {
      reviewsWithComments += 1;
      const firstReview = reviews.reduce((a: any, b: any) =>
        new Date(a.submitted_at) < new Date(b.submitted_at) ? a : b
      );
      pickupTimes.push(
        (new Date(firstReview.submitted_at).getTime() -
          new Date(prDetail.created_at).getTime()) /
          3600000
      );
    }

    const author = prDetail.user.login;
    prCountPerDeveloper[author] = (prCountPerDeveloper[author] || 0) + 1;

    totalCommits += prDetail.commits;
    if (prDetail.additions + prDetail.deletions > OUTSIZED_THRESHOLD) {
      outsizedPrs.push(number);
    }

    const { data: checks } = await axios.get(
      `https://api.github.com/repos/${repo}/commits/${prDetail.head.sha}/check-runs`,
      { headers }
    );
    if (checks.total_count) {
      for (const run of checks.check_runs) {
        totalBuilds += 1;
        if (run.conclusion === 'success') successfulBuilds += 1;
        if (run.started_at && run.completed_at) {
          totalCiDuration +=
            (new Date(run.completed_at).getTime() -
              new Date(run.started_at).getTime()) /
            1000;
        }
      }
    }

    if (prDetail.merged_at) {
      mergedCount += 1;
      cycleTimes.push(
        (new Date(prDetail.merged_at).getTime() -
          new Date(prDetail.created_at).getTime()) /
          3600000
      );
    } else if (prDetail.state === 'closed') {
      closedWithoutMerge += 1;
    } else if (prDetail.state === 'open') {
      prBacklog += 1;
      const updatedAt = new Date(prDetail.updated_at).getTime();
      if ((now - updatedAt) / (24 * 3600000) > STALE_DAYS) {
        stalePrCount += 1;
      }
    }

    if (/hotfix/i.test(prDetail.title) || /hotfix/i.test(prDetail.head.ref)) {
      hotfixCount += 1;
    }
  }

  const totalPRs = prs.length || 1;

  return {
    cycleTime: cycleTimes.reduce((a, b) => a + b, 0) / (cycleTimes.length || 1),
    pickupTime:
      pickupTimes.reduce((a, b) => a + b, 0) / (pickupTimes.length || 1),
    mergeRate: mergedCount / totalPRs,
    closedWithoutMergeRate: closedWithoutMerge / totalPRs,
    reviewCoverage: reviewsWithComments / totalPRs,
    averageCommitsPerPr: totalCommits / totalPRs,
    outsizedPrs,
    buildSuccessRate: totalBuilds ? successfulBuilds / totalBuilds : 0,
    averageCiDuration: totalBuilds ? totalCiDuration / totalBuilds : 0,
    stalePrCount,
    hotfixFrequency: hotfixCount / totalPRs,
    prBacklog,
    prCountPerDeveloper,
    reviewCounts,
  };
}

if (require.main === module) {
  getGitMetrics('octocat/Hello-World').then((m) => console.log(m));
}
