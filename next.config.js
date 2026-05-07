const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  webpack: (config, { isServer }) => {
    // 🚨 FIX PDFJS + CANVAS
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }

    config.resolve.alias.canvas = false;

    return config;
  },
};

module.exports = withPWA(nextConfig);