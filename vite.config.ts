import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    // Reduce memory usage during build
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize rollup options
    rollupOptions: {
      output: {
        // Manual chunk splitting to reduce memory pressure
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          'vendor-excel': ['xlsx'],
        },
      },
    },
    // Minify options
    minify: 'esbuild',
    // Target modern browsers only
    target: 'es2020',
  },
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Reduce memory usage - drop console in production
  esbuild: mode === 'production' ? {
    drop: ['console', 'debugger'],
  } : {},
}));
