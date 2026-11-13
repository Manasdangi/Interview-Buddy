import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Also runs the pure-logic tests that live next to the frontend utilities in ../src.
    include: ['src/**/*.test.ts', '../src/**/*.test.ts'],
  },
})
