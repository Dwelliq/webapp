# Vercel Build Debugging Guide

## Common Build Errors & Solutions

### Error: "Command 'prisma' not found"

**Cause**: Prisma command not accessible when running from `apps/web` directory.

**Solutions**:

1. **Verify Root Directory Setting**
   - Go to Vercel Dashboard → Your Project → Settings → General
   - Check "Root Directory" is set to: `apps/web`
   - If not set, Vercel can't find Next.js or Prisma

2. **Check Build Command**
   - Current setup uses `npx prisma` in `apps/web/package.json`
   - `npx` looks up the directory tree to find prisma
   - Make sure `apps/web/package.json` has:
     ```json
     "build": "cd ../.. && npx prisma generate && cd apps/web && next build"
     ```

3. **Alternative: Use Direct Path**
   If `npx` doesn't work, try:
   ```json
   "build": "cd ../.. && ./node_modules/.bin/prisma generate && cd apps/web && next build"
   ```

4. **Test Locally**
   ```bash
   cd apps/web
   pnpm build
   # Should run: cd ../.. && npx prisma generate && cd apps/web && next build
   ```

---

### Error: "No Next.js version detected"

**Cause**: Vercel is checking the wrong `package.json` (root instead of `apps/web`).

**Solution**:
- **Set Root Directory to `apps/web`** in Vercel Dashboard
- This is CRITICAL - Vercel must know where your Next.js app is
- Go to: Project Settings → General → Root Directory → `apps/web`

---

### Error: "Could not identify Next.js version"

**Cause**: Same as above - Root Directory not set correctly.

**Solution**:
- Set Root Directory to `apps/web` in Vercel dashboard
- This tells Vercel to look at `apps/web/package.json` for Next.js

---

### Error: Prisma generate fails

**Cause**: Database connection or Prisma config issues.

**Solutions**:

1. **Check DATABASE_URL is set** in Vercel environment variables
2. **Use connection pooling string** (not direct connection)
3. **Test Prisma locally first**:
   ```bash
   cd /path/to/project
   pnpm prisma generate
   ```

4. **If generate works but build fails**, the issue might be:
   - Generated client path incorrect
   - Import path in code wrong
   - Check `apps/web/src/lib/prisma.ts` import path

---

### Error: Build succeeds but app doesn't work

**Possible causes**:

1. **Environment variables not set**
   - Check all `NEXT_PUBLIC_*` variables are set
   - Check server-side variables (no `NEXT_PUBLIC_` prefix)

2. **Database not migrated**
   - Run `pnpm prisma db push` manually after first deploy
   - Or create migrations: `pnpm prisma migrate dev`

3. **Generated Prisma client path wrong**
   - Check import in `apps/web/src/lib/prisma.ts`
   - Should be: `import { PrismaClient } from "../../../../generated/prisma/client"`

---

## Debugging Steps

### Step 1: Check Vercel Settings

1. Go to Project → Settings → General
2. Verify:
   - **Root Directory**: `apps/web` ✅
   - **Framework Preset**: Next.js ✅
   - **Build Command**: (should use vercel.json or default) ✅
   - **Output Directory**: `.next` ✅

### Step 2: Check Environment Variables

1. Go to Settings → Environment Variables
2. Verify all required vars are set for **Production**
3. Important ones:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - All others from your `.env.local`

### Step 3: Review Build Logs

1. Go to Deployments → Click failed deployment → Build Logs
2. Look for:
   - Errors (red text)
   - Warnings (orange text)
   - Where it fails (command, line number)

### Step 4: Test Build Locally

```bash
# From project root
cd apps/web
pnpm build
```

If this fails locally, it will fail on Vercel too.

### Step 5: Check File Structure

Make sure:
- `apps/web/package.json` exists
- `apps/web/next.config.ts` exists (or `next.config.js`)
- `prisma/schema.prisma` exists in root
- `package.json` in root has `prisma` in dependencies

---

## Current Configuration

### vercel.json
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### apps/web/package.json (build script)
```json
{
  "scripts": {
    "build": "cd ../.. && npx prisma generate && cd apps/web && next build"
  }
}
```

**How it works**:
1. Vercel sets root directory to `apps/web`
2. Runs `pnpm install` (installs from root, creates `node_modules`)
3. Runs `pnpm build` (which runs the script in `apps/web/package.json`)
4. Script goes up to root, runs `npx prisma generate`
5. Goes back to `apps/web`, runs `next build`
6. Output goes to `.next` in `apps/web`

---

## Still Having Issues?

1. **Check Vercel Community**: https://github.com/vercel/vercel/discussions
2. **Check Build Logs**: Look for specific error messages
3. **Try Simplifying**: Remove Prisma from build, deploy, then add it back
4. **Use Vercel CLI**: Test locally with `vercel dev`

---

## Quick Fixes

### If Prisma still fails:

Add to root `package.json`:
```json
{
  "scripts": {
    "generate": "prisma generate",
    "build:web": "cd apps/web && pnpm build"
  }
}
```

Then in `vercel.json`:
```json
{
  "buildCommand": "pnpm generate && pnpm build:web"
}
```

### If Next.js not detected:

Make absolutely sure Root Directory is `apps/web` in dashboard. This is the #1 cause of this error.

