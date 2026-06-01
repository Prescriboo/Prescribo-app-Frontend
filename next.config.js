/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  // Required for Electron: disable trailing slashes and ensure relative paths
  trailingSlash: false,
  assetPrefix: '.',
}

module.exports = nextConfig
