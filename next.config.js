/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['pixabay.com'],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/student',
        permanent: true,
      },
    ];
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    appName: 'University Online Voting System',
    appVersion: '1.0.0',
  },
};

module.exports = nextConfig;
