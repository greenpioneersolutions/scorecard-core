import { fetchApiData } from '@scorecard/scorecard-api';

async function run() {
  const data = await fetchApiData(
    'https://jsonplaceholder.typicode.com/todos/1'
  );
  console.log(data);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
