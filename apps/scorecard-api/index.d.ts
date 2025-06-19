export interface FetchApiOptions {
  params?: Record<string, any>;
  token?: string;
  headers?: Record<string, string>;
  fields?: string[];
  /** Enable or disable automatic parsing of the response. Default: true */
  autoParse?: boolean;
}
export function fetchApiData(
  url: string,
  options?: FetchApiOptions
): Promise<any>;
