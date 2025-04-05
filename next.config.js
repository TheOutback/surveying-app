/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['https://supabase.com/dashboard/project/zslkcfekjkhkczvdghxi/settings/general'],
      unoptimized: process.env.NODE_ENV !== 'production',
    },
  }
  
  module.exports = nextConfig