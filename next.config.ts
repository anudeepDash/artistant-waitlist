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
    'ADMIN_PASSCODE',
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: https:;",
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
