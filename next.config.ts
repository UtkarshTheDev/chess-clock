import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'chessticks.vercel.app',
        port: '',
        pathname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Turbopack configuration (stable) - simplified for compatibility
  turbopack: {
    // Use only stable Turbopack features
    resolveAlias: {
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/hooks': './src/hooks',
      '@/stores': './src/stores',
      '@/types': './src/types',
      '@/utils': './src/utils',
    },
  },
};

export default nextConfig;
