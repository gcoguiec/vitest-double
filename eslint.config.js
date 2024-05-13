import { typescript, vitest } from '@gcoguiec/eslint-config';

export default [
  {
    ignores: ['out/*', 'dist/*', 'vitest.config.ts']
  },
  ...(await typescript()),
  ...(await vitest({
    typescript: true
  }))
];
