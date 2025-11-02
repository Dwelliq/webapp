import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Fix for Mapbox SDK server-only dependencies
  // Mark these as external so they're not bundled for client
  serverExternalPackages: [
    "@mapbox/mapbox-sdk",
    "keyv",
    "@keyv/redis",
    "@keyv/mongo",
    "@keyv/sqlite",
    "@keyv/postgres",
    "@keyv/mysql",
    "@keyv/etcd",
    "@keyv/offline",
    "@keyv/tiered",
    "import-in-the-middle",
    "require-in-the-middle",
    // Prisma packages
    "@prisma/client",
    "prisma",
  ],
  
  // Configure webpack to handle Prisma runtime imports
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Prisma runtime packages for server builds
      config.externals = config.externals || [];
      if (typeof config.externals === 'object' && !Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      
      // Add Prisma runtime to externals
      const externals = config.externals as any[];
      externals.push({
        '@prisma/client/runtime/library': 'commonjs @prisma/client/runtime/library',
        '@prisma/client/runtime': 'commonjs @prisma/client/runtime',
      });
    }
    
    return config;
  },
};

export default nextConfig;
