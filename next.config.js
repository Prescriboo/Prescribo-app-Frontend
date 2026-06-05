/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  // Required for Electron: disable trailing slashes and ensure relative paths
  trailingSlash: false,
  assetPrefix: '.',
}

module.exports = nextConfig
