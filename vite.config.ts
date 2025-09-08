import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Derive base for GitHub Pages: if deploying to user.github.io repo root keep '/', else '/<repo>/'
// Allow override via GH_PAGES_BASE env for flexibility.
const repoName = 'data-analyst-trainer'
const explicit = process.env.GH_PAGES_BASE
const base = explicit ? explicit : `/${repoName}/`

export default defineConfig({
  plugins: [react()],
  base,
  cacheDir: 'node_modules/.vite',
  resolve: {
    alias: {
      '@engine': '/src/engine'
    }
  },
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          pyodide: ['pyodide'],
          sql: ['sql.js']
        }
      }
    },
  // Avoid dev-only watch settings in CI
  chunkSizeWarningLimit: 1500
  },
  // Enable dependency pre-bundling for faster dev server
  optimizeDeps: {
    include: ['react', 'react-dom', 'pyodide', 'sql.js', 'highlight.js']
  },
  // Enable caching for better performance
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})
