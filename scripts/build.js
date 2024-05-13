// @ts-check
import { context } from 'esbuild';
import dts from 'npm-dts';

new dts.Generator(
  {
    tsc: '-p tsconfig.dist.json',
    entry: 'index.ts',
    output: 'dist/index.d.ts'
  },
  false,
  true
).generate();

context({
  entryPoints: {
    index: './out/index.js'
  },
  bundle: true,
  outdir: './dist',
  external: ['ts-essentials', 'vitest'],
  format: 'esm',
  platform: 'node',
  tsconfig: './tsconfig.dist.json'
}).then(async ctx => {
  console.log('building...');
  await ctx.rebuild();
  await ctx.dispose();
  console.log('finished');
});
