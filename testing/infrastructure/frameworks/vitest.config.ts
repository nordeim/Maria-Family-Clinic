import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './testing/infrastructure/frameworks/vitest/healthcare-setup.ts',
      './src/test/setup.ts'
    ],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.stories.tsx',
        '**/*.config.ts',
        '**/types/',
        'testing/infrastructure/',
        'dist/',
        '.next/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Healthcare-specific components require higher coverage
        'src/components/healthcare/**': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    },
    testTimeout: 30000, // Extended timeout for healthcare data processing
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@testing': path.resolve(__dirname, './testing'),
      '@healthcare': path.resolve(__dirname, './src/components/healthcare')
    }
  },
})