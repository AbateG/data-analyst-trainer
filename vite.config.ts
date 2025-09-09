import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Base path for assets.
// - Default to '/' for general hosting (e.g., local dev, Cloudflare Pages)
// - If building on GitHub Actions/Pages, set to '/<repo>/' unless explicitly overridden
const explicit = process.env.GH_PAGES_BASE
const isGhCi = process.env.GITHUB_ACTIONS === 'true' || process.env.GITHUB_PAGES === 'true'
const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
const ghBase = repo ? `/${repo}/` : '/'
const base = explicit ?? (isGhCi ? ghBase : '/')

// Tiny plugin: on build, copy index.html to 404.html for SPA fallback on GitHub Pages
function ghPagesSpaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'gh-pages-spa-fallback',
  apply: 'build',
    configResolved(cfg: any) {
      outDir = cfg.build?.outDir ?? 'dist'
    },
    closeBundle() {
      try {
        const indexPath = path.join(outDir, 'index.html')
        const notFoundPath = path.join(outDir, '404.html')
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath)
        }
      } catch {
        // no-op: fallback copy best-effort only
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), ghPagesSpaFallback()],
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
