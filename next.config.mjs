/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these — use native Node.js require in API routes
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
        { 'pdf-parse': 'commonjs pdf-parse', mammoth: 'commonjs mammoth' },
      ];
    }
    return config;
  },
};

export default nextConfig;
