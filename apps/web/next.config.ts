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
    "@prisma/client/runtime/library",
    "@prisma/client/runtime",
  ],
  
  // Use webpack instead of Turbopack (for now, until Turbopack config is stable)
  // Remove this if you want to use Turbopack and configure it differently
};

export default nextConfig;
