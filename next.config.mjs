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
  // Разрешаем cross-origin запросы с ngrok домена в режиме разработки
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : '',
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ['https://strattera.ngrok.app'],
};

export default nextConfig;
