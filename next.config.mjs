/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client"],
  webpack: (config, { isServer }) => {
    // Исключаем папку nextadmin-nextjs-pro-v2-main из сборки
    config.module.rules.push({
      test: /nextadmin-nextjs-pro-v2-main/,
      use: 'ignore-loader'
    });
    
    return config;
  },
};

export default nextConfig;
