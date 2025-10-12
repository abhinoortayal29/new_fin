/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  eslint: {
    // false = fail builds on lint errors
    // true = ignore lint errors temporarily
    ignoreDuringBuilds: false
  },
};

export default nextConfig;
