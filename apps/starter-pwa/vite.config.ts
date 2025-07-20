/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const tailwindcss = await import('@tailwindcss/vite');
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/starter-pwa',
    server: {
      port: 3000,
      host: 'localhost',
    },
    preview: {
      port: 3000,
      host: 'localhost',
    },
    plugins: [
      tailwindcss.default(),
      react(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin(['*.md']),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    build: {
      outDir: '../../dist/apps/starter-pwa',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    test: {
      watch: false,
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/starter-pwa',
        provider: 'v8' as const,
      },
    },
  };
});
