import axios from 'axios';

export async function fetchApiData(
  url: string,
  params?: Record<string, any>
): Promise<Record<string, number>> {
  const { data } = await axios.get(url, { params });
  return data;
}

if (require.main === module) {
  fetchApiData('https://example.com/mock').then((d) => console.log(d));
}
