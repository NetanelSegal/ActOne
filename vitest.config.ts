import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: [
      'server/**/*.test.ts',
      'client/src/**/*.test.{ts,tsx}',
      'shared/**/*.test.ts',
    ],
    environment: 'node',
    setupFiles: [path.join(__dirname, 'client', 'src', 'test', 'setup.ts')],
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'client/src'),
      '@shared': path.join(__dirname, 'shared'),
    },
  },
});
