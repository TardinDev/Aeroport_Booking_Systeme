import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Public routes worth indexing. Account and booking pages stay out.
const INDEXED_ROUTES = ['/', '/flights', '/vtc', '/transport', '/privacy', '/terms', '/cookies']

/**
 * Fills the site origin into index.html and emits sitemap.xml and
 * robots.txt, so the three always agree with VITE_SITE_URL.
 */
function seoFiles(siteUrl: string): Plugin {
  return {
    name: 'seo-files',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      const urls = INDEXED_ROUTES.map(
        (route) => `  <url><loc>${siteUrl}${route}</loc><lastmod>${today}</lastmod></url>`
      ).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: [
          'User-agent: *',
          'Allow: /',
          'Disallow: /api/',
          'Disallow: /dashboard',
          'Disallow: /admin',
          'Disallow: /booking/',
          'Disallow: /check-in/',
          ...(siteUrl ? ['', `Sitemap: ${siteUrl}/sitemap.xml`] : []),
          '',
        ].join('\n'),
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = (env.VITE_SITE_URL ?? '').replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss(), seoFiles(siteUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
