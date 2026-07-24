/** @type {import('next').NextConfig} */

// GitHub Pages serves a project site from /<repo>, not from the domain root.
// Set NEXT_PUBLIC_BASE_PATH=/Turkiye-Planner for that; leave it empty for
// Vercel, Netlify, or a custom domain, which all serve from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  // Static export: `npm run build` emits a fully static site in `out/`
  // that can be hosted anywhere (Vercel, Netlify, GitHub Pages, S3...).
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  // Pages resolves /foo/ to /foo/index.html; without this it 404s on refresh.
  trailingSlash: true,
}

module.exports = nextConfig
