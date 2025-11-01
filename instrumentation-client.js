// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "1.0"),
  enableLogs: true,
  sendDefaultPii: true,

  initialScope: {
    tags: {
      component: "client",
    },
  },

  // Filter out known errors (browser extensions, etc.)
  beforeSend(event, hint) {
    // Don't send errors from browser extensions
    if (event.exception?.values?.[0]?.value?.includes('chrome-extension://') ||
        event.exception?.values?.[0]?.value?.includes('moz-extension://')) {
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;