/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jofnlhpjniadvywnohzv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
        search: '',
      },
    ],
  },
  // ... your other config
  allowedDevOrigins: ["10.48.174.165"],
};

export default nextConfig;
