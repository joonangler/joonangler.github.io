import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.tsx'],
    env: {
      POSTS_DIR: path.resolve(__dirname, '__tests__/fixtures/posts'),
      DRAFTS_DIR: path.resolve(__dirname, '__tests__/fixtures/drafts'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist',
        '**/out',
        '**/.next',
        'scripts/',
        '__tests__/helpers/**',
        '__tests__/fixtures/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'out'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
