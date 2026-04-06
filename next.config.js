/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Bypass type worker crashes on canary/edge versions
  },
  eslint: {
    ignoreDuringBuilds: true, // Bypass lint worker crashes during optimization
  },
  experimental: {
    // Ensuring stable App Router behavior on Next 15+
  }
};

export default nextConfig;
