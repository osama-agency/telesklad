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
  // Исключаем old-webapp из обработки
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    externalDir: true
  },
  webpack: (config, { isServer }) => {
    // Исключаем папки из сборки
    config.module.rules.push({
      test: /(nextadmin-nextjs-pro-v2-main|old-webapp|scripts)/,
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
