/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["raw.githubusercontent.com", "cdn.jsdelivr.net"],
  },
};

module.exports = nextConfig;
