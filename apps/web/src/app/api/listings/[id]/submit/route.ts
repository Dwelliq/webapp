import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * POST /api/listings/[id]/submit
 * Submits a listing for moderation (sets status to REVIEW)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find listing
    const listing = await prisma.listing.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if paid
    if (!listing.paid) {
      return NextResponse.json(
        { error: "Payment required before submission" },
        { status: 400 }
      );
    }

    // Update status to REVIEW
    await prisma.listing.update({
      where: { id },
      data: { status: "REVIEW" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting listing:", error);
    return NextResponse.json(
      { error: "Failed to submit listing" },
      { status: 500 }
    );
  }
}

