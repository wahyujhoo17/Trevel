/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Ubah dari "export" ke "standalone"
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
