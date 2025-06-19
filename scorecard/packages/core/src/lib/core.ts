import { getGitMetrics } from '@scorecard/git';
import { getInfraData } from '@scorecard/api';
import { runEngine, EngineResult } from '@scorecard/engine';

export interface Scorecard {
  repo: string;
  apiUrl: string;
  score: EngineResult;
}

/**
 * Generate a scorecard by gathering metrics and running the engine.
 */
export async function createScorecard(repo: string, apiUrl: string): Promise<Scorecard> {
  const git = await getGitMetrics(repo);
  const infra = await getInfraData(apiUrl);

  // Combine a subset of metrics for the engine
  const data = {
    cycleTime: git.cycleTime,
    uptime: infra.uptime,
    incidents: infra.incidents
  };

  const score = runEngine(data);
  return { repo, apiUrl, score };
}
