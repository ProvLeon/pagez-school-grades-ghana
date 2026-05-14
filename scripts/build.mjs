/**
 * Production build wrapper.
 *
 * WHY THIS EXISTS:
 * Vite's build process occasionally leaves dangling async callbacks / file
 * watchers from plugins (e.g. lovable-tagger, esbuild workers) that prevent
 * the Node.js process from exiting naturally after the bundle is written.
 * On Render and Vercel the build job is then held open until their hard
 * 2-hour timeout fires, which sends SIGTERM and marks the deploy as failed —
 * even though the actual build already succeeded.
 *
 * This wrapper calls `process.exit()` explicitly so the CI runner always
 * sees a clean exit immediately after the bundle is written.
 */

import { build } from 'vite';
import { execSync } from 'child_process';

let exitCode = 0;

try {
  await build();
  console.log('✓ Build completed successfully');

  // Generate sitemap after build
  console.log('\n📝 Generating sitemap...');
  execSync('node scripts/generate-sitemap.mjs', { stdio: 'inherit' });
} catch (err) {
  console.error('✗ Build failed:', err);
  exitCode = 1;
} finally {
  // Force-terminate any dangling event-loop handles (file watchers,
  // esbuild service workers, etc.) that would otherwise keep the
  // process alive indefinitely.
  process.exit(exitCode);
}
