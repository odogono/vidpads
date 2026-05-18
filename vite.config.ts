import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      '@components': resolve(root, 'src/components'),
      '@constants': resolve(root, 'src/constants.ts'),
      '@contexts': resolve(root, 'src/contexts'),
      '@helpers': resolve(root, 'src/helpers'),
      '@hooks': resolve(root, 'src/hooks'),
      '@model': resolve(root, 'src/model'),
      '@page': resolve(root, 'src/page'),
      '@types': resolve(root, 'src/types')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  ssr: {
    noExternal: true
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage'
    },
    exclude: ['node_modules', 'dist', 'dist-server', 'e2e']
  },
  server: {
    host: '127.0.0.1',
    port: 3000
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      process.env.npm_package_version ?? '0.0.0'
    )
  }
});
