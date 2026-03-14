import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const getBasePath = (): string => {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];

  if (!process.env.GITHUB_ACTIONS || !repository) {
    return '/';
  }

  return repository.endsWith('.github.io') ? '/' : `/${repository}/`;
};

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
