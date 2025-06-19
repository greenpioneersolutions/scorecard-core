# Scorecard Core

Scorecard Core provides utilities to gather metrics from GitHub, combine them with
external API data and calculate an overall score for a repository. It is a small
collection of Node modules built with Nx.

## Example usage

A complete example can be found in [examples/basic.ts](examples/basic.ts). After
installing dependencies you can run it with ts-node:

```bash
npm install
npx ts-node examples/basic.ts
```

The script fetches metrics for a repository and prints the calculated scorecard
result.

## Building for npm

A helper script `build.js` is provided at the repository root. It compiles the
`@scorecard/scorecard-core` package and prepares the contents of the `dist`
folder so it can be published to the npm registry.

```bash
node build.js
```

This will produce a `dist` directory containing the compiled files and a
`package.json` ready for `npm publish`.
