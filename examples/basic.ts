import { createScorecard } from '@scorecard/scorecard-core';
import { fetchApiData } from '@scorecard/scorecard-api';
import { normalizeData, calculateScore } from '@scorecard/scorecard-engine';
import {
  collectPullRequests,
  calculateMetrics,
  calculateCycleTime,
  calculateReviewMetrics,
} from '@scorecard/scorecard-git';

async function run() {
  const ranges = {
    cycleTime: { min: 0, max: 168 },
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
    apis: [
      { url: 'https://example.com/mock' },
      { url: 'https://example.com/other', options: { params: { q: 'demo' } } },
    ],
    ranges,
    weights,
    deps: {
      fetchApiData,
      engine: { normalizeData, calculateScore },
      git: {
        collectPullRequests,
        calculateMetrics,
        calculateCycleTime,
        calculateReviewMetrics,
      },
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
