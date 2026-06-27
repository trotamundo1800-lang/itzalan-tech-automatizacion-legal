const configuredProxyTarget =
  process.env.INTERNAL_API_URL ||
  (process.env.NEXT_PUBLIC_API_URL?.startsWith('http') ? process.env.NEXT_PUBLIC_API_URL : null) ||
  'http://127.0.0.1:3001';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${configuredProxyTarget.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
