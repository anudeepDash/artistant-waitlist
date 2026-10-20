import type { NextConfig } from "next";

// 1. Environment Variable Validation & Security Checklist
const checkEnvironmentVariables = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASS',
    'SUPER_ADMIN_EMAIL'
  ];

  const missing = requiredVars.filter((key) => {
    const val = process.env[key];
    return !val || val.trim() === '' || val === 'fallback-key';
  });

  if (missing.length > 0) {
    throw new Error(`CRITICAL STARTUP ERROR: Missing required environment variables: ${missing.join(', ')}`);
  }

  // 7. Database Security check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('CRITICAL STARTUP ERROR: Database connection must use TLS/SSL in production (https://).');
  }
};

// Only run check during build or server start, not in client bundles.
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  checkEnvironmentVariables();
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Big enough for an 8 MB photo. Vercel caps request bodies at 4.5 MB anyway,
      // so large videos need direct-to-storage uploads rather than server actions.
      bodySizeLimit: '10mb',
    },
  },
  // 4. Security Headers & 6. CORS Configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self' data: blob: https:; connect-src 'self' wss: https:; frame-src 'self' https://*.firebaseapp.com https://apis.google.com https://www.google.com https://recaptcha.google.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://instagram.com https://open.spotify.com https://*.spotify.com https://*.spotifycdn.com; child-src 'self' https://*.firebaseapp.com https://apis.google.com https://www.google.com https://recaptcha.google.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://instagram.com https://open.spotify.com https://*.spotify.com https://*.spotifycdn.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Restrict CORS to our own domain + localhost during dev
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : 'https://artistant.in',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
