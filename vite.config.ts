import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// NOTE: lovable-tagger is dynamically imported ONLY in development mode.
// A static import at the top level caused its file-watcher to keep the
// Node.js event-loop alive after `vite build` completed, resulting in a
// 2-hour SIGTERM on Render/Vercel.
export default defineConfig(async ({ mode }) => {
  const devPlugins =
    mode === "development"
      ? [(await import("lovable-tagger")).componentTagger()]
      : [];

  return ({
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      ...devPlugins,
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
      // Increase chunk size warning limit (we're being aggressive with splitting)
      chunkSizeWarningLimit: 500,
      // Optimize rollup options
      rollupOptions: {
        output: {
          // Aggressive manual chunk splitting to reduce memory pressure
          // and improve code splitting in the browser
          manualChunks: (id) => {
            // Vendor chunks - split large dependencies
            if (id.includes('node_modules/react') && !id.includes('node_modules/react-')) {
              return 'vendor-react-core';
            }
            if (id.includes('node_modules/react-router-dom')) {
              return 'vendor-router';
            }
            if (id.includes('node_modules/react-hook-form')) {
              return 'vendor-forms';
            }
            if (id.includes('node_modules/@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('node_modules/recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('node_modules/date-fns')) {
              return 'vendor-dates';
            }
            if (id.includes('node_modules/@supabase/supabase-js')) {
              return 'vendor-supabase';
            }
            // Split Excel libs into separate chunks.
            // IMPORTANT: check xlsx-js-style FIRST because its path also
            // contains the string "/xlsx", so the order prevents a false match.
            if (id.includes('node_modules/xlsx-js-style')) {
              return 'vendor-xlsx-style';
            }
            if (id.includes('node_modules/xlsx/') || id.includes('/node_modules/xlsx@')) {
              return 'vendor-xlsx';
            }
            // Split PDF libs
            if (id.includes('node_modules/jspdf')) {
              return 'vendor-jspdf';
            }
            if (id.includes('node_modules/jspdf-autotable')) {
              return 'vendor-jspdf-autotable';
            }
            // Canvas/screenshot library
            if (id.includes('node_modules/html2canvas')) {
              return 'vendor-html2canvas';
            }
            // Utils
            if (id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/cmdk') ||
              id.includes('node_modules/framer-motion')) {
              return 'vendor-utils';
            }
            // Icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
          },
        },
      },
      // Minify options - use terser for better compression
      minify: 'esbuild',
      // Target modern browsers only
      target: 'es2020',
      // Parallel processing for faster builds
      cssCodeSplit: true,
    },
    // Optimize deps
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    // Reduce memory usage - drop console in production
    esbuild: mode === "production" ? {
      drop: ["console", "debugger"],
      keepNames: false, // Further reduce bundle size
    } : {},
  });
});
