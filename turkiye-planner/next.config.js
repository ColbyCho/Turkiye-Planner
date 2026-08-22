/** @type {import('next').NextConfig} */

// Two build modes.
//
//   default        Static export — `npm run build` emits a fully static site
//                  in `out/` that can be hosted anywhere (Vercel, Netlify,
//                  GitHub Pages, S3...). This is what the live site uses.
//
//   PHOTO_PROXY=1  Next server build, which additionally serves
//                  /api/photos — a same-origin reader for the iCloud shared
//                  album, for browsers that won't let the page call Apple
//                  directly. Set it in the Vercel project's env vars to turn
//                  the proxy on; nothing else has to change, the planner
//                  finds the route on its own.
//
// The route lives in `app/api/photos/route.api.ts`. Next only treats a file as
// a route when its extension is in `pageExtensions`, so in the default mode
// the file is inert and the static export stays possible.
const proxy = process.env.PHOTO_PROXY === '1'

const nextConfig = {
  ...(proxy ? {} : { output: 'export' }),
  pageExtensions: proxy ? ['tsx', 'ts', 'api.ts'] : ['tsx', 'ts'],
}

module.exports = nextConfig
