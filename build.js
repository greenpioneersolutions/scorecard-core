const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build the scorecard-core package using Nx
execSync('npx nx build scorecard-core --skip-nx-cache', { stdio: 'inherit' });

const distDir = path.join(__dirname, 'dist');
const packageDir = path.join(__dirname, 'apps/scorecard-core');
const builtDir = path.join(packageDir, 'dist');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// Copy build output
fs.cpSync(builtDir, distDir, { recursive: true });

// Prepare package.json for publishing
const pkg = JSON.parse(
  fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
);
pkg.private = false;
fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(pkg, null, 2),
);

// Copy readme
fs.copyFileSync(
  path.join(__dirname, 'README.md'),
  path.join(distDir, 'README.md'),
);

console.log('Package ready in', distDir);
