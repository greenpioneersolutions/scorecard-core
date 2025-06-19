export interface InfraData {
  uptime: number;
  incidents: number;
}

/**
 * Fetch infrastructure data from an API. Currently mocked.
 */
export async function getInfraData(url: string): Promise<InfraData> {
  // TODO: fetch from provided API
  return { uptime: 99.9, incidents: 0 };
}
