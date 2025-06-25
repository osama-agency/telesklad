/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Оптимизация форматов изображений
    formats: ['image/webp', 'image/avif'],
    // Включаем оптимизацию для внешних изображений
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  serverExternalPackages: ["@prisma/client"],
  
  // Исключаем old-webapp из обработки
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  
  // Экспериментальные функции для производительности
  experimental: {
    externalDir: true,
    // Оптимизация пакетов
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    // Оптимизация CSS
    optimizeCss: true,
  },
  
  // Компиляция и бундлинг
  compiler: {
    // Удаляем console.log в production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    // Минификация React в production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Оптимизация для производительности
  poweredByHeader: false, // Убираем заголовок X-Powered-By
  compress: true, // Включаем gzip сжатие
  
  webpack: (config, { isServer, dev }) => {
    // Исключаем папки из сборки
    config.module.rules.push({
      test: /(nextadmin-nextjs-pro-v2-main|old-webapp|scripts)/,
      use: 'ignore-loader'
    });
    
    // Оптимизации только для production
    if (!dev) {
      // Tree shaking для удаления неиспользуемого кода
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Разделение чанков для лучшего кэширования
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
            priority: 20,
          },
          styles: {
            name: 'styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'all',
            enforce: true,
            priority: 30,
          },
        },
      };
    }
    
    return config;
  },
  
  // Разрешаем cross-origin запросы с ngrok домена в режиме разработки
  allowedDevOrigins: ["https://strattera.ngrok.app"],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : '',
          },
          // Добавляем кэширование для статических ресурсов
          {
            key: 'Cache-Control',
            value: process.env.NODE_ENV === 'production' 
              ? 'public, max-age=31536000, immutable' 
              : 'no-cache',
          },
        ],
      },
    ];
  },
  
  allowedDevOrigins: ['https://strattera.ngrok.app'],
  
  // Настройки среды выполнения
  env: {
    NEXT_TELEMETRY_DISABLED: '1', // Отключаем телеметрию для ускорения
  },
};

export default nextConfig;
