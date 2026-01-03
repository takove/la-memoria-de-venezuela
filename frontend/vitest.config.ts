import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.{js,ts,svelte}'],
      exclude: [
        'src/lib/types.ts',
        'src/lib/**/*.spec.ts',
        'src/lib/**/*.test.ts',
      ],
    },
  },
  resolve: {
    alias: {
      $lib: resolve(__dirname, './src/lib'),
      $app: resolve(__dirname, './.svelte-kit/runtime/app'),
      '$env/static/public': resolve(__dirname, './src/tests/mocks/env-static-public.ts'),
      '$env/dynamic/public': resolve(__dirname, './src/tests/mocks/env-dynamic-public.ts'),
    },
  },
});
