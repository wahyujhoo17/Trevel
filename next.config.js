/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Ubah dari "export" ke "standalone"
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [new RegExp(`^(.+?[\\/]node_modules[\\/])`)]
    };
    return config;
  }
};

module.exports = nextConfig;
