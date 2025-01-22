import { startDebugServer } from '@goatdb/goatdb/server';
import { registerSchemas } from './schema.ts';
import { initLmStudio } from './models/lmstudio.ts';

async function main(): Promise<void> {
  registerSchemas();
  await initLmStudio();
  await startDebugServer({
    path: './server-data',
    jsPath: './scaffold/index.tsx',
    htmlPath: './scaffold/index.html',
    cssPath: './scaffold/index.css',
    assetsPath: './assets',
    watchDir: './',
  });
}

if (import.meta.main) main();
