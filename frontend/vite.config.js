import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

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
