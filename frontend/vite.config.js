import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
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
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-grid': ['ag-grid-react'],
          'vendor-icons': ['react-icons'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
});
