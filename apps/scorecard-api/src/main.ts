import axios from 'axios';
import autoParseFn from 'auto-parse';

export interface FetchApiOptions {
  params?: Record<string, any>;
  token?: string;
  headers?: Record<string, string>;
  fields?: string[];
  /** Enable or disable automatic parsing of the response. Default: true */
  autoParse?: boolean;
}

function pickFields(obj: any, fields: string[]): any {
  const result: Record<string, any> = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      result[field] = obj[field];
    }
  }
  return result;
}

export async function fetchApiData(
  url: string,
  options: FetchApiOptions = {}
): Promise<any> {
  const { params, token, headers = {}, fields, autoParse = true } = options;
  const finalHeaders = { ...headers };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }
  const { data } = await axios.get(url, { params, headers: finalHeaders });
  const result = autoParse ? autoParseFn(data) : data;

  if (!fields || fields.length === 0) {
    return result;
  }

  if (Array.isArray(result)) {
    return result.map((item) =>
      typeof item === 'object' && item !== null
        ? pickFields(item, fields)
        : item
    );
  }

  if (typeof result === 'object' && result !== null) {
    return pickFields(result, fields);
  }

  return result;
}

if (require.main === module) {
  fetchApiData('https://example.com/mock').then((d) => console.log(d));
}
