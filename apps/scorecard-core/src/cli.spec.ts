import fs from 'fs';
import path from 'path';

jest.mock('@scorecard/scorecard-git', () => ({
  collectPullRequests: jest.fn(),
  calculateMetrics: jest.fn(() => ({})),
  calculateCycleTime: jest.fn(() => 0),
  calculateReviewMetrics: jest.fn(() => 0),
}));
jest.mock('@scorecard/scorecard-api', () => ({
  fetchApiData: jest.fn(async () => ({})),
}));
jest.mock('@scorecard/scorecard-engine', () => ({
  normalizeData: jest.fn((v) => v),
  calculateScore: jest.fn(() => ({ scores: { cycleTime: 0.5 }, overall: 0.5 })),
}));

import { runCli } from './main';

describe('runCli', () => {
  it('processes a yaml file and prints results', async () => {
    const yamlPath = path.join(__dirname, 'test-config.yml');
    fs.writeFileSync(
      yamlPath,
      `staticMetrics:\n  cycleTime: 10\nranges:\n  cycleTime:\n    min: 0\n    max: 20\nweights:\n  cycleTime: 1\n`,
    );

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await runCli(['node', 'scorecard', yamlPath]);
      expect(logSpy).toHaveBeenCalled();
      const output = (logSpy.mock.calls[0]?.[0] as string) || '';
      const parsed = JSON.parse(output);
      expect(parsed.overall).toBeCloseTo(0.5);
    } finally {
      logSpy.mockRestore();
      fs.unlinkSync(yamlPath);
    }
  });
});
