/**
 * Prefixes a file in /public with the deployment's base path.
 *
 * Next rewrites its own bundles for `basePath`, but a plain <img src="/x.jpg">
 * is untouched — so on a GitHub Pages project site (served from /<repo>) every
 * postcard and crew photo would 404 without this. Absolute URLs (uploads from
 * Supabase Storage) and data URLs pass through unchanged.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function asset(src: string): string {
  return src.startsWith('/') ? `${BASE_PATH}${src}` : src
}
