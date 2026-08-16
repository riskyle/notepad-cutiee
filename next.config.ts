import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        // Set to true if you never plan to have a landing page at '/'
        // Set to false if you might build a landing page later
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
