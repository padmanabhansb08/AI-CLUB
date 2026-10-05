const { execSync } = require('child_process');

console.log('--- Testing Seed Isolation ---');
try {
  console.log('Running seed with NODE_ENV=production...');
  const prodOutput = execSync('npx tsx src/db/seeds/001_initial_seed.ts', {
    env: { ...process.env, NODE_ENV: 'production' },
    cwd: __dirname + '/server',
    encoding: 'utf8'
  });
  console.log('Production Output:', prodOutput.trim());
} catch (e) {
  console.error('Failed in production run:', e.message);
}

try {
  console.log('Running seed with NODE_ENV=development...');
  const devOutput = execSync('npx tsx src/db/seeds/001_initial_seed.ts', {
    env: { ...process.env, NODE_ENV: 'development' },
    cwd: __dirname + '/server',
    encoding: 'utf8'
  });
  console.log('Development Output:', devOutput.trim());
} catch (e) {
  console.error('Failed in development run:', e.message);
}
