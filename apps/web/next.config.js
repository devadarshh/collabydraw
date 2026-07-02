/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["fabric"],
  webpack: (config) => {
    config.externals.push({
      canvas: "commonjs canvas",
      jsdom: "commonjs jsdom",
    });
    return config;
  },
};

export default nextConfig;
