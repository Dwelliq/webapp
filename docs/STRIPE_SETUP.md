# Stripe Setup Guide

## Required Stripe Keys

You need these environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production
STRIPE_PRICE_LISTING=price_...
STRIPE_PRICE_BOOST=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 1. STRIPE_SECRET_KEY & NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Location:** Stripe Dashboard → Developers → API keys

1. Go to https://dashboard.stripe.com
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. You'll see:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (starts with `sk_test_` or `sk_live_`) → `STRIPE_SECRET_KEY`
   - Click "Reveal test key" or "Reveal live key" to see the full key
   - Use **test keys** during development, **live keys** in production

---

## 2. STRIPE_PRICE_LISTING & STRIPE_PRICE_BOOST

**Location:** Stripe Dashboard → Products → [Your Product] → Pricing

These are **Price IDs** for your products. You need to create products first.

### Step-by-Step:

#### Create "Listing" Product:

1. Go to **Products** in the left sidebar
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: "Listing Fee" (or similar)
   - **Description**: "One-time payment for listing a property"
   - **Pricing model**: One-time
   - **Price**: Enter your listing fee (e.g., $99.00)
   - **Currency**: AUD (or your currency)
   - **Billing period**: One time
4. Click **"Save product"**
5. On the product page, you'll see the **Price ID** (starts with `price_`)
   - Copy this → `STRIPE_PRICE_LISTING`

#### Create "Boost" Product:

1. Go to **Products** → **"+ Add product"**
2. Fill in:
   - **Name**: "Listing Boost" (or similar)
   - **Description**: "Boost your listing to the top of search results"
   - **Pricing model**: One-time (or recurring if you want subscription)
   - **Price**: Enter your boost fee (e.g., $49.00)
   - **Currency**: AUD
   - **Billing period**: One time
3. Click **"Save product"**
4. Copy the **Price ID** → `STRIPE_PRICE_BOOST`

### Alternative: Find Existing Prices

1. Go to **Products** in the left sidebar
2. Click on any product
3. Scroll to **"Pricing"** section
4. You'll see **Price ID** next to each price (format: `price_xxxxx`)
5. Click the price ID to copy it

---

## 3. STRIPE_WEBHOOK_SECRET

**Location:** Stripe Dashboard → Developers → Webhooks → [Your Webhook] → Signing secret

This is the **signing secret** for your webhook endpoint.

### Step-by-Step:

#### Create a Webhook Endpoint:

1. Go to **Developers** → **Webhooks**
2. Click **"+ Add endpoint"**
3. Fill in:
   - **Endpoint URL**: `https://yourdomain.com/api/billing/webhook`
   - **For local testing**: Use Stripe CLI (see below) or ngrok/tunneling service
   - **Description**: "Listing payment webhook"
   - **Events to send**: Select `checkout.session.completed`
     - You can also select `checkout.session.async_payment_succeeded` if using deferred payment methods
4. Click **"Add endpoint"**
5. After creating, click on the webhook
6. In the **"Signing secret"** section, click **"Reveal"**
7. Copy the secret (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### Important Notes:

- **Never commit** webhook secrets to git
- Each webhook endpoint has its own unique signing secret
- If you recreate the webhook, you'll get a new secret (update your env vars)
- Use different webhooks for test vs live mode

---

## Local Development Setup

For local development, you have two options:

### Option 1: Stripe CLI (Recommended)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```

4. **Copy the webhook signing secret** (it will be shown in the terminal output):
   ```bash
   # It will show something like:
   # > Ready! Your webhook signing secret is whsec_xxxxx
   ```
   
   Use this secret in your `.env.local` for local development.

### Option 2: Use Test Webhook Endpoint

1. Use Stripe Dashboard to create a webhook pointing to a staging/test URL
2. Use that webhook's signing secret for testing

---

## Environment Variables Summary

Add to `.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_51... # Get from Developers → API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51... # Get from Developers → API keys

# Stripe Price IDs
STRIPE_PRICE_LISTING=price_1... # Get from Products → [Listing Product] → Price ID
STRIPE_PRICE_BOOST=price_1... # Get from Products → [Boost Product] → Price ID

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Developers → Webhooks → [Your Webhook] → Signing secret
```

---

## Testing

1. **Test checkout**: Use Stripe test cards: `4242 4242 4242 4242`
2. **Test webhook**: Use Stripe CLI or test mode webhook endpoint
3. **Verify**: Check that `listing.paid = true` after successful payment

---

## Production Checklist

Before going live:

- [ ] Switch to **live mode** in Stripe Dashboard
- [ ] Get **live API keys** (not test keys)
- [ ] Create **live products** and get their price IDs
- [ ] Create **live webhook endpoint** pointing to your production URL
- [ ] Update all environment variables with live keys
- [ ] Test end-to-end payment flow in production mode

