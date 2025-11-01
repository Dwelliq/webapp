import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// For Supabase: Get DATABASE_URL from Settings > Database > Connection string > URI
// Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://placeholder",
  },
});
