import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

function manualChunks(id) {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  if (
    id.includes('/react/') ||
    id.includes('/react-dom/') ||
    id.includes('/react-router/')
  ) {
    return 'vendor-react';
  }

  if (id.includes('/recharts/')) {
    return 'vendor-charts';
  }

  if (id.includes('/ag-grid-react/') || id.includes('/ag-grid-community/')) {
    return 'vendor-grid';
  }

  if (id.includes('/react-icons/')) {
    return 'vendor-icons';
  }

  return undefined;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'jsx-in-js',
      enforce: 'pre',
      transform(code, id) {
        if (id.endsWith('.js') && !id.includes('node_modules')) {
          return transformWithOxc(code, id.replace(/\.js$/, '.jsx'));
        }
      },
    },
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    proxy: Object.fromEntries(
      [
        '/api',
        '/user/api',
        '/copilot/api',
        '/admin/api',
        '/review/api',
        '/addressbook/api',
      ].map(path => [
        path,
        {
          target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        },
      ])
    ),
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
});
