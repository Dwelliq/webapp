import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * GET /api/test-sentry
 * Test endpoint to verify Sentry error tracking is working
 * Remove or protect this in production
 */
export async function GET(request: NextRequest) {
  try {
    // Test error tracking
    throw new Error("Test Sentry error tracking - This is intentional!");
  } catch (error) {
    // Sentry will automatically capture this, but we can add context
    Sentry.captureException(error, {
      tags: {
        endpoint: "/api/test-sentry",
        test: true,
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
      },
    });

    return NextResponse.json({
      message: "Test error sent to Sentry! Check your Sentry dashboard.",
      error: error instanceof Error ? error.message : "Unknown error",
      note: "This error was intentionally thrown to test Sentry integration.",
    });
  }
}

