import * as esbuild from 'esbuild';
import inlineWorkerPlugin from 'esbuild-plugin-inline-worker';

await esbuild.build({
  entryPoints: ['src/attributes.ts'],
  bundle: true,
  minify: true,
  target: 'esnext',
  format: 'esm',
  outfile: 'dist/attributes.js',
  plugins: [inlineWorkerPlugin()],
});

console.log('Build complete → dist/attributes.js');
