# Vercel Prisma Build Fix

## Problem
When Root Directory is set to `apps/web` in Vercel Dashboard, commands run from that directory, but Prisma is installed at the project root level.

## Solution

### vercel.json
```json
{
  "buildCommand": "cd ../.. && npx prisma generate && cd apps/web && pnpm build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

**How it works:**
1. Vercel sets Root Directory to `apps/web` (in Dashboard settings)
2. `installCommand` runs from project root and installs all dependencies
3. `buildCommand` runs from `apps/web` directory:
   - `cd ../..` - Goes up to project root
   - `npx prisma generate` - Finds and runs Prisma (npx searches up the directory tree)
   - `cd apps/web` - Goes back to app directory
   - `pnpm build` - Runs the build script

### apps/web/package.json
```json
{
  "scripts": {
    "build": "next build --webpack",
    "postinstall": "cd ../.. && npx prisma generate || true"
  }
}
```

## Important Checklist

1. ✅ **Root Directory in Vercel Dashboard**
   - Go to: Project Settings → General → Root Directory
   - Set to: `apps/web`
   - This is REQUIRED for Vercel to find Next.js

2. ✅ **Prisma in Root package.json**
   - Root `package.json` must have `"prisma": "^6.18.0"` in dependencies

3. ✅ **Environment Variables**
   - `DATABASE_URL` must be set in Vercel (Supabase connection pooling string)

## Why `npx` works
- `npx` automatically searches up the directory tree to find binaries
- When run from `apps/web`, it finds Prisma in `../../node_modules/.bin/prisma`
- No need for explicit paths

## Alternative (if npx doesn't work)
If `npx` still fails, use direct path:
```json
{
  "buildCommand": "cd ../.. && ./node_modules/.bin/prisma generate && cd apps/web && pnpm build"
}
```

