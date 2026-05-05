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
      sourcemap: false,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          // ─── Object-based manualChunks ───────────────────────────────────
          // Using an OBJECT (not a function) is critical here.
          //
          // Function-based splitting assigns modules purely by file path. It
          // cannot reason about transitive dependencies, so Rollup ended up
          // placing a shared utility module (used by both react-dom and
          // recharts) into vendor-react. That module imported something from
          // vendor-charts, creating a circular dependency:
          //
          //   vendor-ui → vendor-react → vendor-charts → vendor-react
          //
          // When vendor-ui executed and called React.forwardRef, the circular
          // reference had left the React object partially uninitialised
          // (undefined), causing the runtime crash.
          //
          // With the OBJECT form, Rollup receives explicit entry-point lists
          // per chunk. It resolves shared sub-dependencies itself, extracts
          // true commons, and never introduces cross-chunk cycles.
          //
          // Dynamically-imported heavy packages (xlsx, jspdf, html2canvas)
          // are omitted intentionally — Rollup splits them into their own
          // async chunks automatically once they're imported with import().
          manualChunks: {
            // React core — react and react-dom must always be co-located.
            // Radix UI does `import * as React from 'react'` at the module
            // top level; if react-dom lands in a different chunk the React
            // object can be undefined when forwardRef is first called.
            'vendor-react': ['react', 'react-dom'],

            // Routing
            'vendor-router': ['react-router-dom'],

            // All Radix UI primitives + closely coupled UI libs that depend
            // on them (cmdk, vaul) — keeping them together avoids a second
            // layer of cross-chunk React references.
            'vendor-ui': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-aspect-ratio',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-radio-group',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slider',
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group',
              '@radix-ui/react-tooltip',
              'cmdk',
              'vaul',
            ],

            // Forms
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],

            // Data fetching
            'vendor-query': ['@tanstack/react-query'],

            // Charts
            'vendor-charts': ['recharts'],

            // General utilities
            'vendor-utils': [
              'date-fns',
              'clsx',
              'tailwind-merge',
              'framer-motion',
              'lucide-react',
            ],

            // Backend client
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
      minify: 'esbuild',
      target: 'es2020',
      cssCodeSplit: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    esbuild: mode === "production" ? {
      drop: ["console", "debugger"],
      keepNames: false,
    } : {},
  });
});
