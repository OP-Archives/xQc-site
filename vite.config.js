import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { execSync } from 'child_process';

const getGitInfo = (cmd, fallback = 'unknown') => {
  try {
    return execSync(cmd).toString().trim();
  } catch {
    return fallback;
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __GIT_HASH__: JSON.stringify(getGitInfo('git rev-parse --short HEAD')),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
          if (id.includes('@mui/x-date-pickers')) return 'muiX';
          if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@mui/icons-material')) return 'muiCore';
          if (id.includes('@emotion/react') || id.includes('@emotion/styled')) return 'emotion';
          if (id.includes('dayjs')) return 'date';
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('node_modules/react/')) return 'react';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
