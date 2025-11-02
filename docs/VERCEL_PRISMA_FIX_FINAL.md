# Vercel Prisma Build Fix - Final Solution

## Problem
Vercel deployment fails with:
```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "prisma" not found
```

This happens because:
1. Vercel sets Root Directory to `apps/web` (required for Next.js detection)
2. Prisma was only installed in root `package.json`
3. When running from `apps/web`, `pnpm prisma` couldn't find the binary

## Solution

### 1. Add Prisma to `apps/web/package.json`
Since Vercel installs from `apps/web` when Root Directory is set, Prisma must be listed there:

```json
{
  "dependencies": {
    "prisma": "^6.18.0",
    "@prisma/client": "^6.18.0"
  }
}
```

### 2. Update `vercel.json`
```json
{
  "buildCommand": "pnpm prisma generate --schema=../../prisma/schema.prisma && pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["syd1"]
}
```

**Key points:**
- `--schema=../../prisma/schema.prisma` points to the schema from `apps/web` directory
- `outputDirectory: ".next"` (not `apps/web/.next`) because commands run from `apps/web`
- `pnpm prisma generate` works because Prisma is now in `apps/web/package.json`

### 3. Update `apps/web/package.json` postinstall
```json
{
  "scripts": {
    "postinstall": "pnpm prisma generate --schema=../../prisma/schema.prisma || true"
  }
}
```

### 4. Important Vercel Dashboard Settings
- **Root Directory**: MUST be set to `apps/web` in Project Settings → General
- **Environment Variables**: Ensure `DATABASE_URL` is set (Supabase connection pooling string)

## Why This Works

1. **Prisma Available**: With `prisma` in `apps/web/package.json`, `pnpm prisma` finds it
2. **Schema Path**: `--schema=../../prisma/schema.prisma` correctly references the schema
3. **Output Path**: Prisma generates to `generated/prisma` at project root (from `prisma.config.ts`)
4. **Build Process**: 
   - `pnpm install` installs Prisma in `apps/web/node_modules`
   - `pnpm prisma generate` runs from `apps/web` and generates client
   - `pnpm build` runs Next.js build

## Testing Locally

To test the same setup locally:
```bash
cd apps/web
pnpm install
pnpm prisma generate --schema=../../prisma/schema.prisma
pnpm build
```

## Alternative: If Build Scripts Blocked

If pnpm blocks Prisma build scripts, you may need to allow them:
```bash
pnpm approve-builds prisma @prisma/client @prisma/engines
```

Or create `.npmrc` in `apps/web/`:
```
enable-pre-post-scripts=true
```

However, Vercel should handle this automatically during deployment.

