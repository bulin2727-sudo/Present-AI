/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large audio payloads for grading
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;