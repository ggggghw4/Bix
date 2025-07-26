/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // تعطيل الوضع الصارم لتحسين الأداء
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['randomuser.me', 'firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    unoptimized: true,
    minimumCacheTTL: 60, // تخزين مؤقت للصور لمدة 60 ثانية
  },
  output: 'standalone',
  poweredByHeader: false, // إزالة رأس X-Powered-By لتحسين الأمان
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/',
          outputPath: 'static/',
          name: '[name].[hash].[ext]',
        },
      },
    });
    
    // تحسين الأداء عن طريق تقليل حجم الحزم
    config.optimization = {
      ...config.optimization,
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // احصل على اسم الحزمة من المسار
              if (module.context) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (match && match[1]) {
                  // تجنب استخدام @ و / في اسم الملف
                  return `npm.${match[1].replace('@', '')}`;
                }
              }
              return 'vendor';
            },
          },
        },
      },
    };

    return config;
  },
};

module.exports = nextConfig;