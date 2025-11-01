import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Example POST route protected by authentication
 * This route demonstrates how to use getCurrentUser() in API routes
 */
export async function POST(request: Request) {
  // Get the current authenticated user
  const user = await getCurrentUser();

  if (!user) {
    // This should never happen if middleware is working correctly,
    // but it's good practice to check anyway
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // User is authenticated, you can now access:
  // - user.id (Prisma user ID)
  // - user.email
  // - user.kycStatus

  const body = await request.json();

  return NextResponse.json({
    message: "Success",
    user: {
      id: user.id,
      email: user.email,
      kycStatus: user.kycStatus,
    },
    // Your route logic here
    data: body,
  });
}

