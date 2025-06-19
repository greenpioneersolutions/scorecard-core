import { createScorecard } from '@scorecard/scorecard-core';

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
    apiUrl: 'https://example.com/mock',
    ranges,
    weights,
  });

  console.log(JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
