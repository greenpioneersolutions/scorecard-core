import type { RawPullRequest } from "../collectors/pullRequests.js";

/**
 * Categorise pull request size by lines changed.
 *
 * @param pr - pull request record
 * @returns "S", "M" or "L" size bucket
 */
export function calculateSizeBucket(pr: RawPullRequest): string {
  const linesChanged = pr.additions + pr.deletions;
  if (linesChanged < 50) return "S";
  if (linesChanged < 400) return "M";
  return "L";
}

import { register } from "../plugins/registry.js";
// Stryker disable all
register({
  slug: "size_bucket",
  description: "Categorises pull request size",
  calculate: calculateSizeBucket,
});
// Stryker restore all

export default calculateSizeBucket;
