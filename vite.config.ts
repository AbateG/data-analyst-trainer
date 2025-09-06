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
})
