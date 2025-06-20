import { createScorecard, scoreMetrics, createRangeNormalizer } from '@scorecard/scorecard-core';

async function run() {
  const normalizePickupTime = createRangeNormalizer(
    [
      { max: 4, score: 100 },
      { max: 6, score: 80 },
      { max: 12, score: 60 },
    ],
    40,
  );
  const normalizePct = (v: number) => Math.round(v * 100);

  const result = await createScorecard({
    git: [
      { key: 'hello', repo: 'octocat/Hello-World', provider: 'github' },
      {
        key: 'spoon',
        repo: 'octocat/Spoon-Knife',
        token: 'MY_TOKEN',
        since: '2024-01-01',
        provider: 'github',
      },
    ],
    apis: [
      {
        key: 'testing',
        url: 'https://jsonplaceholder.typicode.com/posts',
        callback: (data) => data.length,
      },
      {
        key: 'maturity',
        url: 'https://jsonplaceholder.typicode.com/albums',
        callback: (data) => data.length,
      },
      {
        key: 'incident',
        url: 'https://jsonplaceholder.typicode.com/todos',
        callback: (data) => data.length,
      },
      {
        key: 'change',
        url: 'https://jsonplaceholder.typicode.com/users',
        options: { params: { q: 'demo' } },
        callback: (data) => data.length,
      },
    ],
    scorecard: {
      name: 'My Scorecard',
      description: 'A sample scorecard for demonstration purposes',
      version: '1.0.0',
      scores: [
        {
          key: 'hello',
          weight: 0.2,
          description: 'Hello World Repo Score',
          score: (data) => {
            const score = scoreMetrics(data, [
              { weight: 1, metric: 'pickupTime', normalize: normalizePickupTime },
            ]);
            return score.pickupTime;
          },
        },
        {
          key: 'spoon',
          weight: 0.2,
          description: 'Spoon Knife Repo Score',
          score: (data) => {
            const score = scoreMetrics(data, [
              { weight: 0.5, metric: 'pickupTime', normalize: normalizePickupTime },
              { weight: 0.5, metric: 'mergeRate', normalize: normalizePct },
            ]);
            return score.pickupTime;
          },
        },
        {
          key: 'testing',
          weight: 0.1,
          description: 'Testing API Score',
          score: (data) => data,
        },
        {
          key: 'maturity',
          weight: 0.3,
          description: 'Maturity API Score',
          score: (data) => data,
        },
        {
          key: 'incident',
          weight: 0.1,
          description: 'Incident API Score',
          score: (data) => data,
        },
        {
          key: 'change',
          weight: 0.1,
          description: 'Change API Score',
          score: (data) => data,
        },
      ],
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
