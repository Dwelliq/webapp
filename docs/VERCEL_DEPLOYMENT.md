# Vercel Deployment Guide

## Step 1: Connect Your GitHub Repository

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Sign up with your GitHub account (recommended) or email

2. **Import Project**
   - Click **"+ Add New..."** → **"Project"**
   - Import your GitHub repository: `Dwelliq/webapp`
   - If it's not listed, click **"Adjust GitHub App Permissions"** to give Vercel access

3. **Configure Project**
   - **Project Name**: `webapp` (or your preferred name)
   - **Root Directory**: Leave blank (or set to `apps/web` if your Next.js app is in a monorepo subdirectory)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Build Command**: `pnpm build` (or leave default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install`

4. **Important for Monorepo Setup**
   - If your Next.js app is in `apps/web`, set:
     - **Root Directory**: `apps/web`
     - Vercel will automatically detect it's a Next.js app

---

## Step 2: Environment Variables

Before deploying, add all your environment variables in Vercel:

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable for **Production**, **Preview**, and **Development**:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database (Supabase)
DATABASE_URL=postgresql://postgres.skkshaghyggpkpvftwzg:Mezpew-8nupty-siftyr@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_LISTING=price_...
STRIPE_PRICE_BOOST=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk...

# Resend
RESEND_API_KEY=re_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://ddd011e8a196dd3046fbc7626c4e19ed@04510291849248768.ingest.us.sentry.io/4510291858948096
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=dwelliq
SENTRY_PROJECT=dwelliq
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# App URL (for emails, redirects, etc.)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Notes:
- Use **live/production keys** (not test keys) for production environment
- `SENTRY_ENVIRONMENT=production` for production deployments
- `SENTRY_TRACES_SAMPLE_RATE=0.1` (10%) to save quota in production
- Set `NEXT_PUBLIC_APP_URL` to your Vercel domain initially, then your custom domain

---

## Step 3: Database Setup

### Supabase Connection Pooling

Make sure you're using the **connection pooling string** from Supabase:
- Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
- This works better with serverless functions (Vercel)

### Run Migrations

After first deployment, run Prisma migrations:

**Option 1: Via Vercel Build (Recommended)**

Add to your `package.json` in the root:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

**Option 2: Via Vercel CLI**

After deployment, run:
```bash
npx vercel env pull .env.local
pnpm prisma migrate deploy
```

---

## Step 4: Deploy

1. Click **"Deploy"** in Vercel dashboard
2. Vercel will:
   - Install dependencies (`pnpm install`)
   - Build your app (`pnpm build`)
   - Deploy to production
3. First deployment takes 2-3 minutes

---

## Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records as instructed:
   - CNAME record: `www` → `cname.vercel-dns.com`
   - A record: `@` → Vercel IP (if provided)
5. Wait for DNS propagation (usually 5-30 minutes)
6. SSL certificate is automatically provisioned

---

## Step 6: Webhook Configuration

### Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/billing/webhook`
   - Or use your Vercel URL: `https://your-project.vercel.app/api/billing/webhook`
4. Select events: `checkout.session.completed`
5. Copy the **Signing secret** → Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Supabase Webhooks (if needed)

If you have any Supabase webhooks, update them to point to your Vercel URL.

---

## Step 7: Update Environment Variables After Domain Setup

Once your custom domain is set up:

1. Update `NEXT_PUBLIC_APP_URL` in Vercel:
   - Change from `https://your-project.vercel.app` to `https://yourdomain.com`

2. Update Stripe webhook URL:
   - Change to use your custom domain

3. Update any other services that need your domain (Resend, Clerk, etc.)

---

## Step 8: Vercel-Specific Configuration

### Create `vercel.json` (Optional)

Create in project root if you need custom routing:

```json
{
  "buildCommand": "cd apps/web && pnpm build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["syd1"]
}
```

For monorepo, this helps Vercel understand your structure.

### Next.js Config

Your `next.config.js` already has Sentry configured which works with Vercel.

---

## Step 9: Preview Deployments

Every push to a branch creates a preview deployment:
- Great for testing before merging to main
- Each preview gets its own URL
- You can add environment variables for previews too

### Setting Preview Environment Variables

1. Go to **Settings** → **Environment Variables**
2. When adding a variable, choose:
   - **Production**: For main branch
   - **Preview**: For all branch previews
   - **Development**: For `vercel dev` local development

---

## Step 10: Testing After Deployment

1. **Check Deployment Logs**
   - Go to **Deployments** tab
   - Click on your deployment
   - Check build logs for any errors

2. **Test Your App**
   - Visit your Vercel URL
   - Test key features:
     - User authentication (Clerk)
     - Listing creation flow
     - Payment (Stripe test mode first)
     - File uploads (UploadThing)

3. **Monitor Errors**
   - Check Sentry dashboard for any errors
   - Check Vercel function logs

---

## Common Issues & Solutions

### Issue: Build Fails with "Module not found"

**Solution**: Make sure root directory is set correctly if using monorepo.
- Set **Root Directory** to `apps/web` in Vercel project settings

### Issue: Database Connection Errors

**Solution**: 
- Use connection pooling string (not direct connection)
- Check `DATABASE_URL` is correctly set
- Verify Supabase allows connections from Vercel IPs (should work by default)

### Issue: Environment Variables Not Working

**Solution**:
- Make sure variables are set for **Production** environment
- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)
- For `NEXT_PUBLIC_*` vars, rebuild is needed

### Issue: Stripe Webhook Not Working

**Solution**:
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Test webhook in Stripe dashboard → Webhooks → [Your webhook] → Send test webhook

### Issue: Prisma Client Not Generated

**Solution**:
Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Vercel CLI (For Local Testing)

Install Vercel CLI:

```bash
pnpm add -g vercel
```

Commands:

```bash
# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Performance Tips

1. **Enable Edge Functions** (if using middleware)
   - Vercel automatically uses Edge Runtime for middleware

2. **Image Optimization**
   - Vercel automatically optimizes Next.js images
   - Consider using `next/image` for all images

3. **Caching**
   - Vercel caches static assets automatically
   - API routes are serverless (no caching by default)

4. **Database Connection Pooling**
   - Already using Supabase connection pooling (good!)

---

## Monitoring

1. **Vercel Analytics** (Optional)
   - Enable in project settings
   - See page views, performance metrics

2. **Vercel Logs**
   - Go to **Deployments** → Click deployment → **Functions** tab
   - See real-time logs

3. **Sentry Integration**
   - Already configured
   - Errors will show up in Sentry dashboard

---

## Next Steps After Deployment

1. ✅ Test all features work
2. ✅ Set up custom domain
3. ✅ Update all webhook URLs to use custom domain
4. ✅ Switch to production Stripe keys
5. ✅ Set up monitoring/alerts
6. ✅ Configure backups (Supabase handles this)
7. ✅ Set up staging environment (separate Vercel project or preview deployments)

---

## Quick Deploy Checklist

- [ ] GitHub repo connected to Vercel
- [ ] Root directory configured (if monorepo)
- [ ] All environment variables added
- [ ] Using production keys (not test keys)
- [ ] Database connection string is pooling string
- [ ] Stripe webhook URL updated
- [ ] Sentry DSN added
- [ ] Custom domain configured (optional)
- [ ] First deployment successful
- [ ] Tested key features

Your app should now be live! 🚀

