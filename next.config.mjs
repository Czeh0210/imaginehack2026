/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Prevents Turbopack/webpack from bundling these native Node packages.
  // They will be required at runtime instead, which fixes pdf-parse & mammoth
  // being used in API routes (server-side only).
  serverExternalPackages: ['pdf-parse', 'mammoth'],
};

export default nextConfig;
