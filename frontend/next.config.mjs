/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'development',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    NEXT_PUBLIC_MARKETPLACE_CONTRACT: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    NEXT_PUBLIC_REPUTATION_NFT_CONTRACT: process.env.NEXT_PUBLIC_REPUTATION_NFT_CONTRACT,
  },
}

export default nextConfig
