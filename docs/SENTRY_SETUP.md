# Sentry Error Tracking Setup Guide

## What is Sentry?

Sentry is an error tracking and performance monitoring platform. It helps you:
- Catch errors before users report them
- Track performance issues
- Get detailed stack traces
- Monitor API routes and database queries

---

## Step 1: Sign Up & Get Your DSN

1. **Sign up for Sentry**
   - Go to https://sentry.io
   - Sign up for a free account (5,000 events/month free)

2. **Create a Project**
   - After signing up, create a new project
   - Select **"Next.js"** as the platform
   - Give it a name (e.g., "Dwelliq Web App")
   - Choose your organization (or create one)

3. **Get Your DSN**
   - After creating the project, you'll see the **DSN (Data Source Name)**
   - Format: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
   - Copy this DSN

4. **Get Auth Token** (for source maps)
   - Go to **Settings** → **Auth Tokens**
   - Click **"Create New Token"**
   - Scopes needed: `project:read`, `project:releases`
   - Copy the token (starts with `sntrys_`)

---

## Step 2: Environment Variables

Add to `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=dwelliq
SENTRY_PROJECT=dwelliq
SENTRY_ENVIRONMENT=development  # or "production" for prod

# Optional: Adjust sample rates
SENTRY_TRACES_SAMPLE_RATE=1.0  # 1.0 = 100%, 0.1 = 10%
```

For **production**, add to your hosting platform (Vercel, etc.):
- Use different values:
  - `SENTRY_ENVIRONMENT=production`
  - `SENTRY_TRACES_SAMPLE_RATE=0.1` (10% to save quota)

---

## Step 3: Update Sentry Config Files

The config files are already created. We'll update them to use environment variables.

### Update `sentry.server.config.js`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "development",
  
  // Adjust sample rate in production
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "1.0"),
  
  // Enable logs
  enableLogs: true,
  
  // Send user PII (optional, for GDPR compliance)
  sendDefaultPii: true,
  
  // Add custom tags
  initialScope: {
    tags: {
      component: "server",
    },
  },
  
  // Filter out health check endpoints
  beforeSend(event, hint) {
    // Don't send events for health checks
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }
    return event;
  },
});
```

### Update `sentry.edge.config.js`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "development",
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "1.0"),
  enableLogs: true,
  sendDefaultPii: true,
  
  initialScope: {
    tags: {
      component: "edge",
    },
  },
});
```

### Update `instrumentation-client.js`:

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "development",
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "1.0"),
  enableLogs: true,
  sendDefaultPii: true,
  
  // Replay settings (optional, requires @sentry/replay)
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1.0,
  
  initialScope: {
    tags: {
      component: "client",
    },
  },
  
  // Filter out known errors
  beforeSend(event, hint) {
    // Don't send errors from browser extensions
    if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

---

## Step 4: Update Next.js Config

The `next.config.js` already has Sentry configured. Verify it has:

```javascript
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  nextConfig,
  {
    org: process.env.SENTRY_ORG || "dwelliq",
    project: process.env.SENTRY_PROJECT || "dwelliq",
    
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,
    
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
```

---

## Step 5: Using Sentry in Your Code

### Manual Error Tracking

```typescript
import * as Sentry from "@sentry/nextjs";

// Capture exceptions
try {
  // your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}

// Capture messages
Sentry.captureMessage("Something went wrong", "warning");

// Add context
Sentry.setUser({
  id: user.id,
  email: user.email,
});

Sentry.setTag("feature", "listings");
Sentry.setContext("listing", {
  listingId: listing.id,
  status: listing.status,
});
```

### API Route Error Tracking

Example: `apps/web/src/app/api/listings/create/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  try {
    // Your code here
  } catch (error) {
    // Sentry will automatically capture this if you have auto-instrumentation
    // But you can also manually add context:
    Sentry.captureException(error, {
      tags: {
        endpoint: "/api/listings/create",
      },
      extra: {
        requestBody: await request.json(),
      },
    });
    
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
```

### React Component Error Tracking

```typescript
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export function MyComponent() {
  useEffect(() => {
    // Set user context when component loads
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  }, []);

  const handleAction = async () => {
    try {
      // Your action
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          action: "handleAction",
        },
      });
    }
  };
}
```

### Server Actions Error Tracking

```typescript
"use server";

import * as Sentry from "@sentry/nextjs";

export async function createListing(formData: FormData) {
  try {
    // Your server action code
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        action: "createListing",
      },
    });
    throw error;
  }
}
```

---

## Step 6: Performance Monitoring

Sentry automatically tracks:
- API route performance
- Database query performance (with Prisma)
- Page load times
- Navigation transitions

You can add custom transactions:

```typescript
import * as Sentry from "@sentry/nextjs";

// Start a transaction
const transaction = Sentry.startTransaction({
  op: "listing.create",
  name: "Create Listing",
});

// Add spans
const span = transaction.startChild({
  op: "db.query",
  description: "Create listing in database",
});

// Your code here

span.finish();
transaction.finish();
```

---

## Step 7: Source Maps (Better Stack Traces)

Source maps are configured in `next.config.js`. They're uploaded automatically during build.

To manually upload:

```bash
npx @sentry/wizard@latest -i nextjs
```

Or set up in CI/CD:

```yaml
# .github/workflows/deploy.yml (example)
- name: Upload source maps to Sentry
  run: |
    export SENTRY_AUTH_TOKEN=${{ secrets.SENTRY_AUTH_TOKEN }}
    npx @sentry/wizard@latest -i nextjs
```

---

## Step 8: Testing Sentry

### Test Error Tracking

Create a test API route: `apps/web/src/app/api/test-sentry/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    // Test error
    throw new Error("Test Sentry error tracking");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ 
      message: "Error sent to Sentry. Check your dashboard.",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
```

Visit: `http://localhost:3000/api/test-sentry`

Check your Sentry dashboard - you should see the error!

### Test Performance Monitoring

Sentry automatically tracks performance. Just use your app normally and check:
- **Performance** tab in Sentry dashboard
- API route response times
- Database query performance

---

## Step 9: Alerts & Notifications

1. **Go to Alerts** in Sentry dashboard
2. **Create Alert Rule**:
   - Choose trigger: "An issue is created"
   - Set filters (e.g., environment = production)
   - Add actions: Email, Slack, PagerDuty, etc.

Example alerts:
- **Error Rate**: Alert if > 10 errors/minute
- **Performance**: Alert if API routes > 2s response time
- **New Issues**: Alert when new error types appear

---

## Step 10: Production Checklist

- [ ] DSN moved to environment variables (not hardcoded)
- [ ] Source maps uploading correctly
- [ ] Test error tracking works
- [ ] Alerts configured
- [ ] Sample rates adjusted for production (10-20% is usually enough)
- [ ] User context set (so you can see which users are affected)
- [ ] Environment tags set correctly
- [ ] Sensitive data filtered out (passwords, tokens, etc.)

---

## Best Practices

1. **Don't log sensitive data** - Filter PII, passwords, tokens
2. **Adjust sample rates** - 100% in dev, 10-20% in production
3. **Set user context** - Helps identify affected users
4. **Use tags** - Makes it easier to filter/search errors
5. **Create alerts** - Get notified of critical issues
6. **Review regularly** - Check Sentry dashboard weekly
7. **Fix high-priority issues** - Sort by user impact

---

## Troubleshooting

- **Errors not appearing**: Check DSN is correct, check network tab for Sentry requests
- **Source maps not working**: Verify `SENTRY_AUTH_TOKEN` is set, check build logs
- **Too many events**: Reduce `tracesSampleRate` and add more `beforeSend` filters
- **Missing context**: Add `Sentry.setUser()` and `Sentry.setContext()` calls

---

## Pricing

- **Free tier**: 5,000 events/month
- **Team tier**: $26/month for 50,000 events
- Perfect for monitoring production errors and performance

