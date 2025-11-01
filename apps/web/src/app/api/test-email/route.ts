import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getListingSubmittedEmailHtml } from "@/lib/emails/listingSubmitted";

/**
 * POST /api/test-email
 * Test endpoint to send a sample email
 * Remove this in production or protect it with authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Email address required" },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject: "Test Email - Listing Submitted",
      html: getListingSubmittedEmailHtml("123 Test Street, Sydney NSW 2000"),
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Email sent successfully",
        emailId: result.data?.id 
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test-email route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

