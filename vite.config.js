import { execSync } from 'child_process';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const getGitInfo = (cmd, fallback = 'unknown') => {
  try {
    return execSync(cmd).toString().trim();
  } catch {
    return fallback;
  }
};

export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(getGitInfo('git rev-parse --short HEAD')),
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg)$/i,
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { quality: 80 },
    }),
    tailwindcss(),
    compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
    compression({ algorithm: 'brotli', exclude: [/\.(br)$/, /\.(gz)$/] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'prod',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/')
          )
            return 'react-vendor';
          if (id.includes('@tanstack/react-query')) return 'query-vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@daypicker/react'],
  },
});
