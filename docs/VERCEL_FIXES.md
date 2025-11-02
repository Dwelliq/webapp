# Quick Vercel Build Fixes

## Current Issue: Prisma Command Not Found

### The Problem
When Root Directory is set to `apps/web`, Vercel runs commands from that directory. But Prisma is installed in the root `node_modules`, so it's not found.

### Solution Applied

Updated `apps/web/package.json` build script to use the direct path:

```json
{
  "scripts": {
    "build": "cd ../.. && ./node_modules/.bin/prisma generate && cd apps/web && next build"
  }
}
```

This:
1. Goes up to project root (`cd ../..`)
2. Uses direct path to prisma binary (`./node_modules/.bin/prisma`)
3. Goes back to apps/web (`cd apps/web`)
4. Runs Next.js build (`next build`)

### Verification Checklist

Before redeploying, verify:

1. ✅ **Root Directory in Vercel Dashboard**
   - Settings → General → Root Directory = `apps/web`

2. ✅ **Build Script**
   - `apps/web/package.json` has the updated build script

3. ✅ **Prisma in Root**
   - `package.json` (root) has `"prisma": "^6.18.0"` in dependencies

4. ✅ **Environment Variables**
   - `DATABASE_URL` is set (Supabase connection pooling string)

### If Still Failing

Try this alternative build command in `vercel.json`:

```json
{
  "buildCommand": "cd ../.. && ./node_modules/.bin/prisma generate && cd apps/web && pnpm build",
  "outputDirectory": ".next"
}
```

This bypasses the package.json script entirely.

