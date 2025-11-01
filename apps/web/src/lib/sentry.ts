import * as Sentry from "@sentry/nextjs";
import { getCurrentUser } from "./auth";

/**
 * Set Sentry user context from authenticated user
 * Call this in API routes or server components after getting the user
 */
export async function setSentryUser() {
  const user = await getCurrentUser();
  
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  }
  
  return user;
}

/**
 * Set Sentry context for API routes
 */
export function setSentryContext(context: {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: "debug" | "info" | "warning" | "error" | "fatal";
}) {
  if (context.tags) {
    Object.entries(context.tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }
  
  if (context.extra) {
    Object.entries(context.extra).forEach(([key, value]) => {
      Sentry.setContext(key, value);
    });
  }
  
  if (context.level) {
    Sentry.setLevel(context.level);
  }
}

/**
 * Capture exception with context
 */
export function captureExceptionWithContext(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) {
  if (context) {
    setSentryContext(context);
  }
  
  Sentry.captureException(error);
}

